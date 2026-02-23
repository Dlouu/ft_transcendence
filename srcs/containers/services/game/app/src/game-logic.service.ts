import { Injectable } from "@nestjs/common";
import { Game } from "./domain/UnoGame";
import { GameState, CardCode } from "./domain/GameEnums";
import { DeckService } from "./deck.service";
import { GameRepositoryService } from "./game-repository";
import { UnoPlayer } from "./domain/UnoPlayer";
import { CardDto } from "./dto/card.dto";
import { Card } from "./domain/UnoCard";

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
}
