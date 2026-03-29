import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { Game } from "./domain/UnoGame";
import { GameState, CardCode, CardFamily } from "./domain/GameEnums";
import { DeckService } from "./deck.service";
import { GameRepositoryService } from "./game-repository";
import { UnoPlayer } from "./domain/UnoPlayer";
import { CardDto } from "./dto/card.dto";
import { Card } from "./domain/UnoCard";
import { GameWinDto, GameWinPlayerDto } from "./dto/game-win.dto";
import { toDrewCardDto } from "./dto/drawn-card.dto";
import { GameService } from "./game.service";
import { GameLoggerService } from "./logger.service";
import { toStatsPayloadDto } from "./dto/stats-payload.dto";
import { GAME_CONFIG } from "./game.config";

// Handles the rules of the game (turns, UNO shouts, card validation).
@Injectable()
export class GameLogicService {
	private colorPickCallbacks = new Map<string, (color: CardFamily) => void>();
	private readonly unoRevealDelayMs = GAME_CONFIG.uno.revealDelayMs;
	private readonly unoCallWindowMs = GAME_CONFIG.uno.callWindowMs;
	private readonly unoPendingTimeouts = new Map<string, NodeJS.Timeout>();

	constructor(
		private readonly deckService: DeckService,
		private readonly gameRepository: GameRepositoryService,
		@Inject(forwardRef(() => GameService))
		private readonly gameService: GameService,
		private readonly logger: GameLoggerService,
	) {}

	private getIoServer() {
		return this.gameService.getServer();
	}

	// ==========================
	// ======= START GAME =======
	// ==========================

	/**
	 * Starts the game automatically when all registered players are connected.
	 * @param game Current game instance to evaluate.
	 * @returns true when the game starts, otherwise false.
	 */
	tryStart(game: Game): boolean {
		if (game.connectedPlayers.size === game.expectedPlayers.length) {
			const started = this.startGame(game);
			if (started) {
				return started;
			}
		}

		return false;
	}

	/**
	 * Initializes gameplay state, shuffles/deals cards, and sets the game to PLAYING.
	 * @param game Current game instance to initialize.
	 * @returns true when initialization succeeds, otherwise false.
	 */
	startGame(game: Game): boolean {
		if (!game || game.state === GameState.PLAYING) {
			return false;
		}

		game.addBots();

		this.randomizePlayerOrder(game);

		game.currentPlayerIndex = 0;
		game.currentDirection = "CLOCKWISE";

		if (!game.currentFamily && game.discard.length > 0) {
			const topCard = game.discard.peek();
			if (!topCard) {
				return false;
			}
			game.currentFamily = topCard.family;
		}

		game.pendingUnoPlayerIndex = null;
		game.turnCount = 0;

		const now = Date.now();
		game.turnStartTime = now;
		game.lastActionTime = now;

		game.deck.setCards(
			this.deckService.shuffleDeck(this.deckService.createDeck()),
		);

		this.deckService.startDeal(game);

		for (const player of game.players) {
			player.win_game = false;
			player.nbr_uno = 0;
			player.nbr_uwu = 0;
			player.nbr_4cards = 0;
			player.nbr_drew = 0;
			player.biggest_hand = 0;
			player.updateBiggestHand(player._hand.length);
		}

		game.state = GameState.PLAYING;
		return true;
	}

	/**
	 * Randomizes players order using a Fisher-Yates shuffle.
	 * @param game Current game instance whose players array will be shuffled.
	 * @returns void
	 */
	randomizePlayerOrder(game: Game): void {
		for (let i = game.players.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[game.players[i], game.players[j]] = [game.players[j], game.players[i]];
		}
	}

	// ===============================
	// ======= PLAY VALIDATION =======
	// ===============================

	/**
	 * Checks whether the given player currently has the exact card they want to play.
	 * @param cardDto Card request containing the expected card value and family.
	 * @param player Player whose hand is validated.
	 * @returns Index of the matching card in the player's hand, or -1 if not found.
	 */
	doesPlayerHaveCard(cardDto: CardDto, player: UnoPlayer): number {
		return player._hand.findIndex(
			(c) => c.value === cardDto.cardCode && c.family === cardDto.cardFamily,
		);
	}

	/**
	 * Verifies whether it is currently the specified player's turn.
	 * @param game Current game instance containing turn state.
	 * @param player Player to verify.
	 * @returns true if the player index matches the current player index, otherwise false.
	 */
	isPlayersTurn(game: Game, player: UnoPlayer): boolean {
		const playerIndex = game.players.findIndex(
			(p) => p._id === player._id || p._name === player._name,
		);
		return playerIndex === game.currentPlayerIndex;
	}

	isPlayable(topCard: Card | undefined, playingCard: CardDto): boolean {
		if (!topCard || !playingCard) {
			return false;
		}

		if (
			playingCard.cardCode === CardCode.Wild ||
			playingCard.cardCode === CardCode.WildDrawFour
		) {
			return true;
		}

		return (
			topCard.family === playingCard.cardFamily ||
			topCard.value === playingCard.cardCode
		);
	}

	// ==============================
	// ======= GAME LOGIC =======
	// ==============================

	/**
	 * Reverses the current turn direction between clockwise and counter-clockwise.
	 * @param game Current game instance containing direction state.
	 * @returns void
	 */
	reverseTurnOrder(game: Game): void {
		game.currentDirection =
			game.currentDirection === "CLOCKWISE" ? "COUNTER-CLOCKWISE" : "CLOCKWISE";
	}

	/**
	 * Moves turn control to the next player according to the current direction.
	 * @param game Current game instance containing player order and turn index.
	 * @returns void
	 */
	goToNextPlayerIndex(game: Game): void {
		if (game.deck.length === 0) {
			this.deckService.discardToDeck(game);

			if (game.deck.length === 0) {
				this.getIoServer()?.to(game.roomName).emit("game:deck:empty");
			} else {
				this.getIoServer()?.to(game.roomName).emit("game:deck:shuffled");
			}
		}

		if (game.currentDirection === "CLOCKWISE") {
			game.currentPlayerIndex =
				(game.currentPlayerIndex + 1) % game.players.length;
		} else {
			game.currentPlayerIndex =
				(game.currentPlayerIndex - 1 + game.players.length) %
				game.players.length;
		}
	}

	getNextPlayer(game: Game): UnoPlayer {
		if (game.currentDirection === "CLOCKWISE") {
			const nextIndex = (game.currentPlayerIndex + 1) % game.players.length;
			return game.players[nextIndex];
		}

		const nextIndex =
			(game.currentPlayerIndex - 1 + game.players.length) % game.players.length;
		return game.players[nextIndex];
	}

	private randomCardFamily(): CardFamily {
		const playableFamilies: CardFamily[] = [
			...GAME_CONFIG.deck.playableFamilies,
		];

		const randomIndex = Math.floor(Math.random() * playableFamilies.length);
		return playableFamilies[randomIndex];
	}

	private pickBotCardFamily(player: UnoPlayer): CardFamily {
		const familyCounts = new Map<CardFamily, number>();

		for (const card of player._hand) {
			if (card.family === CardFamily.WILD) {
				continue;
			}

			const currentCount = familyCounts.get(card.family) ?? 0;
			familyCounts.set(card.family, currentCount + 1);
		}

		if (familyCounts.size === 0) {
			return this.randomCardFamily();
		}

		let bestCount = 0;
		const bestFamilies: CardFamily[] = [];

		for (const [family, count] of familyCounts.entries()) {
			if (count > bestCount) {
				bestCount = count;
				bestFamilies.length = 0;
				bestFamilies.push(family);
				continue;
			}

			if (count === bestCount) {
				bestFamilies.push(family);
			}
		}

		const randomIndex = Math.floor(Math.random() * bestFamilies.length);
		return bestFamilies[randomIndex];
	}

	private formatDurationToDdHhMmSs(durationMs: number): number {
		const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
		const days = Math.min(99, Math.floor(totalSeconds / 86400));
		const hours = Math.floor((totalSeconds % 86400) / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		return Number(
			`${days.toString().padStart(2, "0")}${hours
				.toString()
				.padStart(2, "0")}${minutes.toString().padStart(2, "0")}${seconds
				.toString()
				.padStart(2, "0")}`,
		);
	}

	async askPlayerColor(game: Game, player: UnoPlayer): Promise<CardFamily> {
		if (player._isBot) {
			return this.pickBotCardFamily(player);
		}

		if (!player._socket) {
			return this.randomCardFamily();
		}

		player._socket.emit("game:wild:choose-color");

		return new Promise<CardFamily>((resolve) => {
			const timeout = setTimeout(() => {
				this.colorPickCallbacks.delete(player._id);
				resolve(this.randomCardFamily());
			}, GAME_CONFIG.turn.wildColorPickTimeoutMs);

			this.colorPickCallbacks.set(player._id, (color: CardFamily) => {
				clearTimeout(timeout);
				this.colorPickCallbacks.delete(player._id);
				resolve(color);
			});
		});
	}

	onColorPicked(playerId: string, color: CardFamily): void {
		const callback = this.colorPickCallbacks.get(playerId);
		if (callback) {
			callback(color);
			return;
		}

		const game = this.gameRepository.getGameByConnectedPlayer(playerId);
		if (!game) {
			return;
		}

		const player = this.gameRepository.getPlayerInGame(game, playerId);
		if (!player) {
			return;
		}

		this.logger.invalidAction(
			player._id,
			player._name,
			game.roomName,
			`pick_wild_color_without_prompt:${color}`,
		);
	}

	clearPendingUno(game: Game, skipTurnTimeoutRestart = false): void {
		const timeout = this.unoPendingTimeouts.get(game.roomName);
		if (timeout) {
			clearTimeout(timeout);
			this.unoPendingTimeouts.delete(game.roomName);
		}

		game.pendingUnoPlayerIndex = null;

		if (!skipTurnTimeoutRestart && game.state === GameState.PLAYING) {
			this.gameService.startTurnTimeout(game);
		}
	}

	drawCardsWithEvents(
		game: Game,
		player: UnoPlayer,
		iterNbr: number,
	): { success: boolean; deckEmpty: boolean } {
		const io = this.getIoServer();

		if (game.deck.length === 0) {
			this.deckService.discardToDeck(game);
			if (game.deck.length === 0) {
				io?.to(game.roomName).emit("game:deck:empty");
				return { success: false, deckEmpty: true };
			}

			io?.to(game.roomName).emit("game:deck:shuffled");
		}

		for (let i = 0; i < iterNbr; i++) {
			const card = game.deck.pop();
			if (!card) {
				return { success: false, deckEmpty: false };
			}

			player._hand.push(card);
			player.hasDrawThisTurn = true;

			player.incrementNbrDrew(1);
			player.updateBiggestHand(player._hand.length);

			if (!player._isBot && player._socket) {
				player._socket.emit(
					"game:draw:self",
					toDrewCardDto(player._name, card),
				);
				player._socket
					.to(game.roomName)
					.emit("game:draw:others", toDrewCardDto(player._name, undefined));
			} else
				io?.to(game.roomName).emit(
					"game:draw:others",
					toDrewCardDto(player._name, undefined),
				);
		}

		return { success: true, deckEmpty: false };
	}

	onUno(game: Game, player: UnoPlayer): void {
		const io = this.getIoServer();

		const playerIndex = game.players.findIndex((p) => p._id === player._id);
		if (playerIndex === -1) {
			return;
		}

		game.pendingUnoPlayerIndex = playerIndex;
		player.hasShoutedUno = false;
		this.clearPendingUno(game, true);
		game.pendingUnoPlayerIndex = playerIndex;

		if (!player._isBot && player._socket)
			player._socket.emit("game:uno:pending:self");

		setTimeout(() => {
			const pendingIndex = game.pendingUnoPlayerIndex;
			if (pendingIndex === null) {
				return;
			}

			const pendingPlayer = game.players[pendingIndex];
			if (
				!pendingPlayer ||
				pendingPlayer._id !== player._id ||
				pendingPlayer._hand.length !== 1
			) {
				return;
			}

			if (!player._isBot && player._socket)
				player._socket.to(game.roomName).emit("game:uno:pending:others");
			else
				this.getIoServer()?.to(game.roomName).emit("game:uno:pending:others");
		}, this.unoRevealDelayMs);

		const timeout = setTimeout(() => {
			const pendingIndex = game.pendingUnoPlayerIndex;
			if (pendingIndex === null) {
				this.unoPendingTimeouts.delete(game.roomName);
				return;
			}

			const pendingPlayer = game.players[pendingIndex];
			if (
				!pendingPlayer ||
				pendingPlayer._id !== player._id ||
				pendingPlayer._hand.length !== 1
			) {
				this.unoPendingTimeouts.delete(game.roomName);
				return;
			}

			this.clearPendingUno(game);
			this.drawCardsWithEvents(game, pendingPlayer, 2);

			this.getIoServer()?.to(game.roomName).emit("game:uno:expired");
			this.gameService.tryRunBotTurn(game);
		}, this.unoCallWindowMs);

		this.unoPendingTimeouts.set(game.roomName, timeout);
	}

	async onVictory(game: Game, winner: UnoPlayer): Promise<void> {
		if (!game || !winner || game.state === GameState.GAME_OVER) {
			return;
		}

		const winnerStillInGame = game.players.some((p) => p._id === winner._id);
		if (!winnerStillInGame || winner._hand.length !== 0) {
			return;
		}

		game.state = GameState.GAME_OVER;
		game.pendingUnoPlayerIndex = null;

		for (const player of game.players) {
			this.colorPickCallbacks.delete(player._id);
		}

		this.clearPendingUno(game);
		this.gameService.clearTurnTimeout(game.roomName);

		const duration = Date.now() - game.createdAt;
		const durationDdHhMmSs = this.formatDurationToDdHhMmSs(duration);
		const dto: GameWinDto = {
			winner: winner._name,
			players: game.players.map(
				(player): GameWinPlayerDto => ({
					name: player._name,
					id: player._id,
					isBot: player._isBot,
					cardsLeft: player._hand.length,
				}),
			),
			gameDuration: durationDdHhMmSs,
			turnNbr: Math.floor(game.turnCount / game.players.length),
		};

		game.winner_player_id = winner._id;
		winner.win_game = true;

		const gameEndDto = toStatsPayloadDto(game);

		// TODO: Ask Theosaurus to tell me again how to add the env truc...
		await fetch("http://api:5050/user/game/stats", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(gameEndDto),
		})
		.then((response) => {
			if (response.status === 400) {
				return response.json().then((error) => {
					this.logger.error(`Stats API returned 400: ${JSON.stringify(error)}`);
					return error;
				});
			}
			return response;
		})
		.catch((err) => {
			this.logger.error(`Failed to send stats: ${err}`);
		});

		this.getIoServer()?.to(game.roomName).emit("game:win", dto);
		this.logger.gameEnd(
			game.roomName,
			winner._name,
			duration,
			Math.floor(game.turnCount / game.players.length),
		);

		this.gameRepository.deleteGame(game);
		this.logger.gameDelete(game.roomName, "Game finished.");
	}
}
