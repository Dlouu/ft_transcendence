import { Texture } from "pixi.js";
import { Hand } from "./Hand";
import { UnoCard } from "./UnoCard";
import { CardPool } from "./CardPool";

export class Opponent {
	public readonly name: string;
	public readonly index: number;

	private _hand: Hand;
	private _cardBack: Texture;

	constructor(name: string, index: number, hand: Hand, cardBack: Texture) {
		this.name = name;
		this.index = index;
		this._hand = hand;
		this._cardBack = cardBack;
	}

	public get hand(): Hand {
		return this._hand;
	}

	/**
	 * Adds n cards to the opponent hand (visual only, face down).
	 */
	public initializeHand(count: number, pool: CardPool): void {
		for (let i = 0; i < count; i++) {
			const card = pool.getCard();
			// Opponents cards are always face down for us
			card.setFaceBackCard(this._cardBack, null);
			card.setIsFaceUp(false);
			this._hand.addCard(card);
		}
	}

	public addCard(card: UnoCard): void {
		card.setFaceBackCard(this._cardBack, null);
		this._hand.addCard(card);
	}

	public setCardBack(cardBack: Texture): void {
		this._cardBack = cardBack;
		// Update all existing cards in hand with new cardBack
		const cards = this._hand.children.filter((child) => child instanceof UnoCard);
		cards.forEach((card: any) => {
			card.setFaceBackCard(this._cardBack, null);
		});
	}

	public removeCard(card: UnoCard): void {
		this._hand.removeCard(card);
	}

	public destroy(): void {
		// Hand cleanup is handled by the Manager/Service cleanup routine
		// identifying children of the stage.
		// But we can clear references here.
	}
}
