import { Injectable } from "@nestjs/common";
import { Card, CardCode, CardFamily, isNumberCard } from "./domain/UnoCard";
import { Game, GameState } from "./domain/UnoGame";
import { toInitHandDto } from "./dto/init-hand.dto";

// Handles card generation, shuffling, dealing, and deck management
@Injectable()
export class DeckService {
	// ============================
	// ======= DECK CREATE ========
	// ============================

	/**
	 * Creates a complete UNO deck with number, action, and wild cards.
	 * @returns A newly created array of cards representing a full deck.
	 */
	createDeck(): Card[] {
		const deck: Card[] = [];

		const pushCard = (code: CardCode, family: CardFamily) => {
			const c = new Card();
			c.value = code;
			c.family = family;
			deck.push(c);
		};

		const colors: CardFamily[] = [
			CardFamily.ONE,
			CardFamily.TWO,
			CardFamily.THREE,
			CardFamily.FOUR,
		];

		const numberCards: CardCode[] = [
			CardCode.One,
			CardCode.Two,
			CardCode.Three,
			CardCode.Four,
			CardCode.Five,
			CardCode.Six,
			CardCode.Seven,
			CardCode.Eight,
			CardCode.Nine,
		];

		for (const color of colors) {
			pushCard(CardCode.Zero, color);
			for (const numberCard of numberCards) {
				pushCard(numberCard, color);
				pushCard(numberCard, color);
			}

			for (let i = 0; i < 2; i++) {
				pushCard(CardCode.Skip, color);
				pushCard(CardCode.Reverse, color);
				pushCard(CardCode.DrawTwo, color);
			}
		}

		for (let i = 0; i < 4; i++) {
			pushCard(CardCode.Wild, CardFamily.WILD);
			pushCard(CardCode.WildDrawFour, CardFamily.WILD);
		}

		return deck;
	}

	// =============================
	// ======= DECK RECYCLE ========
	// =============================

	/**
	 * Recycles the discard pile back into the draw deck while keeping the
	 * current top discard card in place.
	 * @param game The current game instance whose deck/discard piles are updated.
	 * @returns Nothing.
	 */
	discardToDeck(game: Game): void {
		if (game.discard.length <= 1) return;

		const topCard = game.discard.pop();

		game.deck = this.shuffleDeck([...game.deck, ...game.discard]);

		game.discard = [];
		if (topCard) {
			game.discard.push(topCard);
		}
	}

	// =============================
	// ======= DECK SHUFFLE ========
	// =============================

	/**
	 * Shuffles a deck in place using the Fisher-Yates algorithm.
	 * @param deck The deck to shuffle.
	 * @returns The same deck instance after shuffling.
	 */
	shuffleDeck(deck: Card[]): Card[] {
		for (let i = deck.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[deck[i], deck[j]] = [deck[j], deck[i]];
		}
		return deck;
	}

	// ============================
	// ======= DEALING START ======
	// ============================

	/**
	 * Starts the dealing phase by giving each player 7 cards, emitting initial
	 * hands to sockets, and placing a valid number card on the discard pile.
	 * @param game The current game instance to initialize for play.
	 * @returns Nothing.
	 */
	startDeal(game: Game): void {
		const cardsPerPlayer = 7;

		game.state = GameState.DEALING;

		for (const p of game.players) {
			for (let i = 0; i < cardsPerPlayer; i++) {
				const drawnCard = game.deck.pop();
				if (drawnCard) {
					p._hand.push(drawnCard);
				}
			}
			if (p._socket) p._socket.emit("game:initHand", toInitHandDto(p._hand));
		}

		let firstCard = game.deck.pop();
		while (firstCard && !isNumberCard(firstCard.value)) {
			game.deck.unshift(firstCard);
			game.deck = this.shuffleDeck(game.deck);
			firstCard = game.deck.pop();
		}

		if (firstCard) {
			game.discard.push(firstCard);
			game.currentFamily = firstCard.family;
		}
	}
}
