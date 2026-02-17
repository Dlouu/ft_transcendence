import { Injectable } from "@nestjs/common";
import { Game, GameState } from "./domain/UnoGame";
import { DeckService } from "./deck.service";
import { GameRepositoryService } from "./game-repository";
import { UnoPlayer } from "./domain/UnoPlayer";
import { CardDto } from "./dto/play-card.dto";

// Handles the rules of the game (turns, UNO shouts, card validation).
@Injectable()
export class GameLogicService {
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
	 * @returns void
	 */
	tryStart(game: Game): void {
		if (game.connectedPlayers.size === game.players.length) {
			this.startGame(game);
			console.log(`Game '${game.roomName}' started !`);
		}
	}

	/**
	 * Initializes gameplay state, shuffles/deals cards, and sets the game to PLAYING.
	 * @param game Current game instance to initialize.
	 * @returns void
	 */
	startGame(game: Game): void {
		if (!game || game.state === GameState.PLAYING) {
			return;
		}

		this.randomizePlayerOrder(game);

		game.currentPlayerIndex = 0;
		game.currentDirection = "CLOCKWISE";

		if (!game.currentFamily && game.discard.length > 0) {
			const topCard = game.discard[game.discard.length - 1];
			game.currentFamily = topCard.family;
		}

		game.pendingUnoPlayerIndex = null;
		game.unoShouted = false;
		game.hasDrawnThisTurn = false;

		const now = Date.now();
		game.turnStartTime = now;
		game.lastActionTime = now;

		game.deck = this.deckService.shuffleDeck(this.deckService.createDeck());

		this.deckService.startDeal(game);

		game.state = GameState.PLAYING;
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
	 * @returns true if a matching card exists in the player's hand, otherwise false.
	 */
	doesPlayerHaveCard(cardDto: CardDto, player: UnoPlayer): boolean {
		return player._hand.some(
			(c) => c.value === cardDto.cardCode && c.family === cardDto.cardFamily,
		);
	}

	/**
	 * Verifies whether it is currently the specified player's turn.
	 * @param game Current game instance containing turn state.
	 * @param playerName Name of the player to verify.
	 * @returns true if the player index matches the current player index, otherwise false.
	 */
	isPlayersTurn(game: Game, playerName: string): boolean {
		const playerIndex = game.players.findIndex((p) => p._name === playerName);
		return playerIndex === game.currentPlayerIndex;
	}

	// ==============================
	// ======= GAME LOGIC =======
	// ==============================

	/**
	 * Reverses the current turn direction between clockwise and counter-clockwise.
	 * @param game Current game instance containing direction state.
	 * @returns void
	 */
	reverseTurnOrder(game: Game) {
		game.currentDirection =
			game.currentDirection === "CLOCKWISE" ? "COUNTER-CLOCKWISE" : "CLOCKWISE";
	}

	/**
	 * Moves turn control to the next player according to the current direction.
	 * @param game Current game instance containing player order and turn index.
	 * @returns void
	 */
	goToNextPlayerIndex(game: Game) {
		if (game.currentDirection === "CLOCKWISE") {
			game.currentPlayerIndex =
				(game.currentPlayerIndex + 1) % game.players.length;
		} else {
			game.currentPlayerIndex =
				(game.currentPlayerIndex - 1 + game.players.length) %
				game.players.length;
		}
	}

	passTurn(gameId: string, playerName: string) {
		// Is this function necessary ?
	}
}
