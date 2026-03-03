import { Injectable } from "@nestjs/common";
import { Game } from "./domain/UnoGame";
import { GameState, CardCode, CardFamily } from "./domain/GameEnums";
import { DeckService } from "./deck.service";
import { GameRepositoryService } from "./game-repository";
import { UnoPlayer } from "./domain/UnoPlayer";
import { CardDto } from "./dto/card.dto";
import { Card } from "./domain/UnoCard";
import { GameWinDto, GameWinPlayerDto } from "./dto/game-win.dto";

// Handles the rules of the game (turns, UNO shouts, card validation).
@Injectable()
export class GameLogicService {
	private colorPickCallbacks = new Map<string, (color: CardFamily) => void>();
	private readonly unoRevealDelayMs = 500;

	constructor(
		private readonly deckService: DeckService,
		private readonly gameRepository: GameRepositoryService,
	) {}

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
				console.log(`Game '${game.roomName}' started !`);
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

		const now = Date.now();
		game.turnStartTime = now;
		game.lastActionTime = now;

		game.deck.setCards(
			this.deckService.shuffleDeck(this.deckService.createDeck()),
		);

		this.deckService.startDeal(game);

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
		const playerIndex = game.players.findIndex((p) => p._name === player._name);
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
			CardFamily.ONE,
			CardFamily.TWO,
			CardFamily.THREE,
			CardFamily.FOUR,
		];

		const randomIndex = Math.floor(Math.random() * playableFamilies.length);
		return playableFamilies[randomIndex];
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
		if (!player._socket) {
			return this.randomCardFamily();
		}

		player._socket.emit("game:wild:choose-color");

		return new Promise<CardFamily>((resolve) => {
			const timeout = setTimeout(() => {
				this.colorPickCallbacks.delete(player._id);
				resolve(this.randomCardFamily());
			}, 10000);

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
		}
	}

	onUno(game: Game, player: UnoPlayer): void {
		if (!player._socket) {
			return;
		}

		const playerIndex = game.players.findIndex((p) => p._id === player._id);
		if (playerIndex === -1) {
			return;
		}

		game.pendingUnoPlayerIndex = playerIndex;
		player.hasShoutedUno = false;

		player._socket.emit("game:uno:pending:self");

		setTimeout(() => {
			const pendingIndex = game.pendingUnoPlayerIndex;
			if (pendingIndex === null) {
				return;
			}

			const pendingPlayer = game.players[pendingIndex];
			if (!pendingPlayer || pendingPlayer._id !== player._id || pendingPlayer._hand.length !== 1) {
				return;
			}

			player._socket?.to(game.roomName).emit("game:uno:pending:others");
		}, this.unoRevealDelayMs);
	}

	onVictory(game: Game, winner: UnoPlayer): void {
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

		const durationDdHhMmSs = this.formatDurationToDdHhMmSs(
			Date.now() - game.createdAt,
		);
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
			turnNbr: Math.max(0, game.discard.length - 1),
		};

		const emitterPlayer = game.players.find((player) => !!player._socket);
		if (emitterPlayer?._socket) {
			emitterPlayer._socket.emit("game:win", dto);
			emitterPlayer._socket.to(game.roomName).emit("game:win", dto);
		}

		this.gameRepository.deleteGame(game);

		console.log(
			`Game '${game.roomName}' won by '${winner._name}'. Game closed.`,
		);
	}
}
