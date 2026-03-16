import { Card } from "./UnoCard";

export class DeckPile {
	private cards: Card[];

	/**
	 * Creates a new pile with optional initial cards.
	 * @param initialCards Initial cards to place in this pile.
	 */
	constructor(initialCards: Card[] = []) {
		this.cards = [...initialCards];
	}

	/**
	 * Returns the number of cards currently in the pile.
	 * @returns The current pile size.
	 */
	get length(): number {
		return this.cards.length;
	}

	/**
	 * Returns the top card without removing it.
	 * @returns The top card, or undefined when the pile is empty.
	 */
	peek(): Card | undefined {
		return this.cards[this.cards.length - 1];
	}

	/**
	 * Adds a card on top of the pile.
	 * @param card Card to add.
	 * @returns The new pile size.
	 */
	push(card: Card): number {
		return this.cards.push(card);
	}

	/**
	 * Removes and returns the top card.
	 * @returns The removed top card, or undefined when the pile is empty.
	 */
	pop(): Card | undefined {
		return this.cards.pop();
	}

	/**
	 * Adds a card to the bottom of the pile.
	 * @param card Card to add.
	 * @returns The new pile size.
	 */
	unshift(card: Card): number {
		return this.cards.unshift(card);
	}

	/**
	 * Iterates through all cards in this pile.
	 * @param callback Function executed for each card.
	 * @returns Nothing.
	 */
	forEach(callback: (card: Card, index: number) => void): void {
		this.cards.forEach(callback);
	}

	/**
	 * Replaces all cards in the pile.
	 * @param cards New cards for the pile.
	 * @returns Nothing.
	 */
	setCards(cards: Card[]): void {
		this.cards = [...cards];
	}

	/**
	 * Returns a shallow copy of the pile cards.
	 * @returns A new array containing all pile cards.
	 */
	toArray(): Card[] {
		return [...this.cards];
	}

	/**
	 * Removes all cards from the pile.
	 * @returns Nothing.
	 */
	clear(): void {
		this.cards = [];
	}
}