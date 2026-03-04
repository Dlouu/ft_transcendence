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

@Injectable()
export class GameService {
	private io?: Server;
	private readonly gameInitReadyByRoom = new Map<string, Set<string>>();

	constructor(
		private readonly gameRepository: GameRepositoryService,
		private readonly gameLogic: GameLogicService,
		private readonly deckService: DeckService,
		@Inject(forwardRef(() => GamePlayService))
		private readonly gamePlay: GamePlayService,
		private readonly botLogic: BotLogicService,
	) {}

	setServer(io: Server): void {
		this.io = io;
	}

	getServer(): Server | undefined {
		return this.io;
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

		if (game && game.connectedPlayers.size === 0) {
			this.gameInitReadyByRoom.delete(game.roomName);

			console.log(
				`No connected players left in ${game.roomName}. Deleting game.`,
			);
			this.gameRepository.deleteGame(game);
		}
	}

	async playCard(playerId: string, dto: CardDto): Promise<void> {
		const game = this.gameRepository.getGameByConnectedPlayer(playerId);
		if (!game || game.state !== GameState.PLAYING) {
			return;
		}

		const player = this.gameRepository.getPlayerInGame(game, playerId);
		if (!player) {
			return;
		}

		if (game.pendingUnoPlayerIndex !== null) {
			return;
		}

		if (!await this.gamePlay.playCard(game, dto, player))
      return ;

		if (player._hand.length === 0) {
			this.gameLogic.onVictory(game, player);
			return;
		}

		if (player._hand.length === 1) {
			this.gameLogic.onUno(game, player);
		}

		const advanceSteps = this.getTurnAdvanceStepsAfterPlay(dto.cardCode, game.players.length);
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
		this.tryRunBotTurn(game);
  }

  drawCard(playerId: string): void {
		const game = this.gameRepository.getGameByConnectedPlayer(playerId);
		if (!game || game.state !== GameState.PLAYING) {
			return;
		}

		const player = this.gameRepository.getPlayerInGame(game, playerId);
		if (!player) {
			return;
		}

		if (game.pendingUnoPlayerIndex !== null) {
			return;
		}

    if (!this.gamePlay.drawCard(game, 1, false, player)) {
      return ;
    }

    this.gameLogic.goToNextPlayerIndex(game);

    const now = Date.now();
    game.lastActionTime = now;
    game.turnStartTime = now;

		const nextTurnDto: NextTurnDto = {
			currentPlayerIndex: game.currentPlayerIndex,
			turnDirection: game.currentDirection,
		};

		this.io?.to(game.roomName).emit("game:nextTurn", nextTurnDto);
		this.tryRunBotTurn(game);
  }

	shoutUno(playerId: string): void {
		const game = this.gameRepository.getGameByConnectedPlayer(playerId);
		if (!game || game.state !== GameState.PLAYING) {
			return ;
		}

		const player = this.gameRepository.getPlayerInGame(game, playerId);
		if (!player) {
			return ;
		}

		this.gamePlay.shoutUno(game, player);
	}

	private getTurnAdvanceStepsAfterPlay(cardCode: CardCode, playerCount: number): number {
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

	private tryRunBotTurn(game: Game): void {
		if (!this.isBotTurn(game)) {
			return;
		}

		this.botLogic.playTurn(game, game.currentPlayerIndex);
	}
}
