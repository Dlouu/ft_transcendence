import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { CreateGameDto } from "./dto/create-game.dto";
import { Game } from "./domain/UnoGame";
import { CardCode, GameState } from "./domain/GameEnums";
import { Server, Socket } from "socket.io";
import { DeckService } from "./deck.service";
import { GameLogicService } from "./game-logic.service";
import { GameRepositoryService } from "./game-repository";
import { GamePlayService } from "./game-play.service";
import { toCardDtoArray } from "./dto/init-game.dto";
import { CardDto } from "./dto/card.dto";
import { NextTurnDto } from "./dto/next-turn.dto";
import { BotLogicService } from "./bot-logic.service";
import { GameLoggerService } from "./logger.service";

@Injectable()
export class GameService {
	private io?: Server;
	private readonly gameInitReadyByRoom = new Map<string, Set<string>>();
	private readonly turnTimeoutByRoom = new Map<string, NodeJS.Timeout>();
	private readonly turnTimeoutMs = 10000;

	constructor(
		private readonly gameRepository: GameRepositoryService,
		private readonly gameLogic: GameLogicService,
		private readonly deckService: DeckService,
		@Inject(forwardRef(() => GamePlayService))
		private readonly gamePlay: GamePlayService,
		private readonly botLogic: BotLogicService,
		private readonly logger: GameLoggerService,
	) {}

	setServer(io: Server): void {
		this.io = io;
	}

	getServer(): Server | undefined {
		return this.io;
	}

	isGameActive(game: Game): boolean {
		return this.gameRepository.getGameByName(game.roomName) === game;
	}

	clearTurnTimeout(roomName: string): void {
		const existingTimeout = this.turnTimeoutByRoom.get(roomName);
		if (!existingTimeout) {
			return;
		}

		clearTimeout(existingTimeout);
		this.turnTimeoutByRoom.delete(roomName);
	}

	startTurnTimeout(game: Game): void {
		this.clearTurnTimeout(game.roomName);

		if (
			game.state !== GameState.PLAYING ||
			game.pendingUnoPlayerIndex !== null
		) {
			return;
		}

		const currentPlayer = game.players[game.currentPlayerIndex];
		if (!currentPlayer) {
			return;
		}

		const timeout = setTimeout(() => {
			this.onTurnTimeout(game.roomName, currentPlayer._id);
		}, this.turnTimeoutMs);

		this.turnTimeoutByRoom.set(game.roomName, timeout);
	}

	private onTurnTimeout(roomName: string, expectedPlayerId: string): void {
		this.clearTurnTimeout(roomName);

		const game = this.gameRepository.getGameByName(roomName);
		if (
			!game ||
			game.state !== GameState.PLAYING ||
			game.pendingUnoPlayerIndex !== null
		) {
			return;
		}

		const currentPlayer = game.players[game.currentPlayerIndex];
		if (!currentPlayer || currentPlayer._id !== expectedPlayerId) {
			return;
		}

		this.io?.to(game.roomName).emit("game:turn:timeout", {
			playerId: currentPlayer._id,
			playerName: currentPlayer._name,
		});

		this.drawCard(currentPlayer._id, game);
	}

	create(dto: CreateGameDto): Game {
		return this.gameRepository.create(dto);
	}

	join(playerId: string, socket: Socket): void {
		const game = this.gameRepository.join(playerId, socket);

		const started = this.gameLogic.tryStart(game);
		if (!started || !this.io || game.discard.length === 0) {
			return;
		}

		this.emitGameInit(game);
	}

	onPlayerInitReady(playerId: string): void {
		if (!this.io) {
			return;
		}

		const game = this.gameRepository.getGameByConnectedPlayer(playerId);
		if (!game || game.state !== GameState.PLAYING) {
			return;
		}

		if (!game.expectedPlayers.includes(playerId)) {
			return;
		}

		const roomReadyPlayers = this.gameInitReadyByRoom.get(game.roomName);
		if (!roomReadyPlayers) {
			return;
		}

		roomReadyPlayers.add(playerId);

		if (roomReadyPlayers.size < game.expectedPlayers.length) {
			return;
		}

		game.createdAt = Date.now();

		this.io.to(game.roomName).emit("game:start");

		this.gameInitReadyByRoom.delete(game.roomName);
		this.startTurnTimeout(game);
		this.tryRunBotTurn(game);
	}

	private emitGameInit(game: Game): void {
		this.gameInitReadyByRoom.set(game.roomName, new Set<string>());

		const topDiscard = game.discard.peek();
		if (!topDiscard) {
			return;
		}
		const players = game.players.map((player) => ({
			name: player._name,
			cardBack: player._cardBack,
		}));

		game.players.forEach((player, index) => {
			const initGameDto = {
				players,
				discardTopCard: {
					cardCode: topDiscard.value,
					cardFamily: topDiscard.family,
				},
				firstPlayerIndex: game.currentPlayerIndex,
				turnDirection: game.currentDirection,
				startCardNbr: 7, // TODO: Replace by a const variable
				playerIndex: index,
				playerHand: toCardDtoArray(player._hand),
				cardTheme: game.cardTheme,
			};
			if (player._socket) {
				player._socket.emit("game:init", initGameDto);
			}
		});
	}

	leave(playerId: string, socket: Socket): void {
		if (typeof playerId !== "string" || playerId.trim() === "") {
			return;
		}

		const game = this.gameRepository.getGameByConnectedPlayer(playerId);
		if (!game) {
			return;
		}

		this.gameRepository.leave(playerId, socket);

		if (game.connectedPlayers.size === 0) {
			game.state = GameState.GAME_OVER;
			game.pendingUnoPlayerIndex = null;
			this.gameLogic.clearPendingUno(game, true);
			this.gameInitReadyByRoom.delete(game.roomName);
			this.clearTurnTimeout(game.roomName);

			this.gameRepository.deleteGame(game);
			this.logger.gameDelete(game.roomName, "No more real player left in game.");
			return;
		}

		this.tryRunBotTurn(game);
	}

	async playCard(
		playerId: string,
		dto: CardDto,
		game: Game | undefined,
	): Promise<void> {
		if (!game) {
			game = this.gameRepository.getGameByConnectedPlayer(playerId);
		}

		if (!game || !this.isGameActive(game) || game.state !== GameState.PLAYING) {
			return;
		}

		const player = this.gameRepository.getPlayerInGame(game, playerId);
		if (!player) {
			return;
		}

		if (game.pendingUnoPlayerIndex !== null) {
			this.logger.invalidAction(
				player._id,
				player._name,
				game.roomName,
				"play_card_during_uno_window",
			);
			return;
		}

		if (!this.gameLogic.isPlayersTurn(game, player)) {
			this.logger.invalidAction(
				player._id,
				player._name,
				game.roomName,
				"play_card_out_of_turn",
			);
			return;
		}

		this.clearTurnTimeout(game.roomName);

		if (!(await this.gamePlay.playCard(game, dto, player))) return;

		game.turnCount += 1;

		if (player._hand.length === 0) {
			this.gameLogic.onVictory(game, player);
			return;
		}

		if (player._hand.length === 1) {
			this.gameLogic.onUno(game, player);
			this.botLogic.scheduleUnoReaction(game);
		}

		const advanceSteps = this.getTurnAdvanceStepsAfterPlay(
			dto.cardCode,
			game.players.length,
		);
		for (let i = 0; i < advanceSteps; i++) {
			this.gameLogic.goToNextPlayerIndex(game);
		}

		const now = Date.now();
		game.lastActionTime = now;
		game.turnStartTime = now;

		const nextTurnDto: NextTurnDto = {
			currentPlayerIndex: game.currentPlayerIndex,
			turnDirection: game.currentDirection,
		};

		this.io?.to(game.roomName).emit("game:nextTurn", nextTurnDto);
		this.startTurnTimeout(game);
		this.tryRunBotTurn(game);
	}

	drawCard(playerId: string, game: Game | undefined): void {
		if (!game) {
			game = this.gameRepository.getGameByConnectedPlayer(playerId);
		}

		if (!game || !this.isGameActive(game) || game.state !== GameState.PLAYING) {
			return;
		}

		const player = this.gameRepository.getPlayerInGame(game, playerId);
		if (!player) {
			return;
		}

		if (game.pendingUnoPlayerIndex !== null) {
			this.logger.invalidAction(
				player._id,
				player._name,
				game.roomName,
				"draw_card_during_uno_window",
			);
			return;
		}

		if (!this.gameLogic.isPlayersTurn(game, player)) {
			this.logger.invalidAction(
				player._id,
				player._name,
				game.roomName,
				"draw_card_out_of_turn",
			);
			return;
		}

		this.clearTurnTimeout(game.roomName);
		const playerIndexBeforeDraw = game.currentPlayerIndex;

		if (!this.gamePlay.drawCard(game, 1, false, player)) {
			// If draw failed because deck is empty, GamePlayService already advanced the turn.
			// Continue the turn loop here so bots can keep playing without stalling.
			if (game.currentPlayerIndex !== playerIndexBeforeDraw) {
				const now = Date.now();
				game.lastActionTime = now;
				game.turnStartTime = now;

				this.startTurnTimeout(game);
				this.tryRunBotTurn(game);
			}
			return;
		}

		this.logger.drawCard(player._id, player._name, game.roomName, 1, "Player drew.");

		game.turnCount += 1;

		this.gameLogic.goToNextPlayerIndex(game);

		const now = Date.now();
		game.lastActionTime = now;
		game.turnStartTime = now;

		const nextTurnDto: NextTurnDto = {
			currentPlayerIndex: game.currentPlayerIndex,
			turnDirection: game.currentDirection,
		};

		this.io?.to(game.roomName).emit("game:nextTurn", nextTurnDto);
		this.startTurnTimeout(game);
		this.tryRunBotTurn(game);
	}

	shoutUno(playerId: string): void {
		const game = this.gameRepository.getGameByConnectedPlayer(playerId);
		if (!game || game.state !== GameState.PLAYING) {
			return;
		}

		const player = this.gameRepository.getPlayerInGame(game, playerId);
		if (!player) {
			return;
		}

		if (game.pendingUnoPlayerIndex === null) {
			this.logger.invalidAction(
				player._id,
				player._name,
				game.roomName,
				"shout_uno_without_pending_uno",
			);
			return;
		}

		const hadPendingUno = game.pendingUnoPlayerIndex !== null;
		const didHandleUno = this.gamePlay.shoutUno(game, player);

		// If UNO was resolved and the current player is a bot, resume automated play.
		if (
			(didHandleUno || hadPendingUno) &&
			game.pendingUnoPlayerIndex === null
		) {
			this.tryRunBotTurn(game);
		}
	}

	private getTurnAdvanceStepsAfterPlay(
		cardCode: CardCode,
		playerCount: number,
	): number {
		switch (cardCode) {
			case CardCode.Skip:
			case CardCode.DrawTwo:
			case CardCode.WildDrawFour:
				return 2;
			case CardCode.Reverse:
				return playerCount === 2 ? 2 : 1;
			default:
				return 1;
		}
	}

	private isBotTurn(game: Game): boolean {
		const currentPlayer = game.players[game.currentPlayerIndex];
		return !!currentPlayer?._isBot;
	}

	tryRunBotTurn(game: Game): void {
		if (
			!this.isGameActive(game) ||
			game.state !== GameState.PLAYING ||
			game.pendingUnoPlayerIndex !== null
		) {
			return;
		}

		if (!this.isBotTurn(game)) {
			return;
		}

		this.botLogic.playTurn(game, game.currentPlayerIndex);
	}
}
