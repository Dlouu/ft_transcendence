import { UnoCard } from "./UnoCard";
import { Container, Rectangle, Graphics } from "pixi.js";
import { CardCode, CardFamily, HandRotation } from "./GameEnums";
import { GAME_CUSTOMIZATION } from "../config/gameCustomization";

const CARD_FAMILY_SORT_ORDER: Record<CardFamily, number> = {
	[CardFamily.ONE]: 0,
	[CardFamily.TWO]: 1,
	[CardFamily.THREE]: 2,
	[CardFamily.FOUR]: 3,
	[CardFamily.WILD]: 4,
};

const CARD_CODE_SORT_ORDER: Record<CardCode, number> = {
	[CardCode.Zero]: 0,
	[CardCode.One]: 1,
	[CardCode.Two]: 2,
	[CardCode.Three]: 3,
	[CardCode.Four]: 4,
	[CardCode.Five]: 5,
	[CardCode.Six]: 6,
	[CardCode.Seven]: 7,
	[CardCode.Eight]: 8,
	[CardCode.Nine]: 9,
	[CardCode.Skip]: 10,
	[CardCode.Reverse]: 11,
	[CardCode.DrawTwo]: 12,
	[CardCode.Wild]: 13,
	[CardCode.WildDrawFour]: 14,
};

export class Hand extends Container {
	private static readonly HOVER_JUMP_PERCENT =
		GAME_CUSTOMIZATION.hand.hoverJumpPercent;
	private static readonly HOVER_SPREAD_PERCENT =
		GAME_CUSTOMIZATION.hand.hoverSpreadPercent;

	private _cards: UnoCard[] = [];
	private _hoveredCard: UnoCard | null = null;
	private _underlay: Graphics;
	private _onCardClick?: (card: UnoCard) => void;
	private _isTurnActive: boolean = false;

	// Config
	private _areaPercent: number; // Fraction of the screen length the hand may occupy (e.g. 0.6 = 60%)
	private _overlapPercent: number; // Fraction of a card's width that is hidden behind the next card (e.g. 0.3 = 30% overlap)
	private _cardRatio: number; // Card width-to-height ratio used to derive card width from its height (e.g. 0.66 ≈ standard card aspect)
	private _isInteractive: boolean;
	private _reverseCards: boolean;

	// Dimensions
	private _canvasWidth: number = 0;
	private _canvasHeight: number = 0;

	constructor(
		areaPercent: number = GAME_CUSTOMIZATION.hand.defaults.areaPercent,
		overlapPercent: number = GAME_CUSTOMIZATION.hand.defaults.overlapPercent,
		cardRatio: number = GAME_CUSTOMIZATION.hand.defaults.cardRatio,
		rotation: HandRotation = HandRotation.Bottom,
		isInteractive: boolean = false,
		reverseCards: boolean = false,
		isVisible: boolean = true,
		onCardClick?: (card: UnoCard) => void,
	) {
		super();
		this._areaPercent = areaPercent;
		this._overlapPercent = overlapPercent;
		this._cardRatio = cardRatio;
		this._isInteractive = isInteractive;
		this._reverseCards = reverseCards;
		this._onCardClick = onCardClick;
		this.visible = isVisible;

		this.sortableChildren = true;
		this.angle = rotation;

		// Initialize Underlay
		this._underlay = new Graphics();
		this._underlay.zIndex = GAME_CUSTOMIZATION.hand.underlayZIndex;
		this.addChild(this._underlay);
	}

	public addCard(card: UnoCard): void {
		this._cards.push(card);
		this.addChild(card);

		if (this._isInteractive) {
			card.eventMode = "static";
			card.cursor = "pointer";
			card.on("pointerenter", () => this.onCardHover(card));
			card.on("pointerleave", () => this.onCardOut(card));
			card.on("pointertap", () => this.onCardClick(card));
		}

		this.updateLayout();
	}

	public removeCard(card: UnoCard): void {
		const index = this._cards.indexOf(card);
		if (index > -1) {
			if (this._isInteractive) {
				card.removeAllListeners();
				card.eventMode = "none";
				card.cursor = "default";
			}

			this._cards.splice(index, 1);
			this.removeChild(card);

			if (this._hoveredCard === card) {
				this._hoveredCard = null;
			}

			this.updateLayout();
		}
	}

	public removeCardAt(index: number): UnoCard | null {
		if (index < 0 || index >= this._cards.length) {
			return null;
		}

		const card = this._cards[index];
		this.removeCard(card);
		return card;
	}

	public removeFirstMatchingCard(
		family: CardFamily,
		value: CardCode,
	): UnoCard | null {
		const matchingCard = this._cards.find((card) => {
			return card.card?.family === family && card.card?.value === value;
		});

		if (!matchingCard) {
			return null;
		}

		this.removeCard(matchingCard);
		return matchingCard;
	}

	public sortCards(
		compareFn?: (left: UnoCard, right: UnoCard) => number,
	): void {
		const comparator =
			compareFn ??
			((left: UnoCard, right: UnoCard): number => {
				const leftCard = left.card;
				const rightCard = right.card;

				if (!leftCard && !rightCard) return 0;
				if (!leftCard) return 1;
				if (!rightCard) return -1;

				const byFamily =
					CARD_FAMILY_SORT_ORDER[leftCard.family] -
					CARD_FAMILY_SORT_ORDER[rightCard.family];
				if (byFamily !== 0) {
					return byFamily;
				}

				return (
					CARD_CODE_SORT_ORDER[leftCard.value] -
					CARD_CODE_SORT_ORDER[rightCard.value]
				);
			});

		this._cards.sort(comparator);
		this.updateLayout();
	}

	private onCardHover(card: UnoCard): void {
		if (this._hoveredCard !== card) {
			this._hoveredCard = card;
			this.updateLayout();
		}
	}

	private onCardOut(card: UnoCard): void {
		if (this._hoveredCard === card) {
			this._hoveredCard = null;
			this.updateLayout();
		}
	}

	private onCardClick(card: UnoCard): void {
		this._onCardClick?.(card);
	}

	public resize(width: number, height: number): void {
		this._canvasWidth = width;
		this._canvasHeight = height;
		this.updateLayout();
	}

	public setRotation(rotation: HandRotation): void {
		this.angle = rotation;
		this.updateLayout();
	}

	public setVisible(visible: boolean): void {
		this.visible = visible;
	}

	public setTurnActive(active: boolean): void {
		if (this._isTurnActive === active) {
			return;
		}

		this._isTurnActive = active;
		this.updateLayout();
	}

	private updateLayout(): void {
		if (this._canvasWidth === 0) return;

		const count = this._cards.length;
		const isVertical =
			Math.abs(this.angle) === 90 || Math.abs(this.angle) === 270;

		// --- 1. Calculate Card Size ---
		const maxCardThickness =
			this._canvasHeight * GAME_CUSTOMIZATION.hand.layout.cardHeightRatio;
		const cardHeight = maxCardThickness;
		const cardWidth = cardHeight * this._cardRatio;

		// --- 2. Calculate Available Spread Space ---
		const screenLengthAvailable = isVertical
			? this._canvasHeight
			: this._canvasWidth;
		const handLengthAvailable = screenLengthAvailable * this._areaPercent;

		// --- Update Underlay ---
		// We draw an ellipse. To make it closer to the edge, we shift the center
		// positive Y (downwards in local space), so the arc sits lower.
		const underlayYOffset =
			cardHeight * GAME_CUSTOMIZATION.hand.layout.underlayYOffsetRatio;

		this._underlay.clear();
		this._underlay.ellipse(
			0,
			underlayYOffset,
			handLengthAvailable / 2,
			cardHeight * GAME_CUSTOMIZATION.hand.layout.underlayHeightRatio,
		);

		if (this._isTurnActive) {
			this._underlay.fill({
				color: GAME_CUSTOMIZATION.hand.layout.activeUnderlayFillColor,
				alpha: GAME_CUSTOMIZATION.hand.layout.activeUnderlayFillAlpha,
			});
			this._underlay.stroke({
				color: GAME_CUSTOMIZATION.hand.layout.activeUnderlayStrokeColor,
				alpha: GAME_CUSTOMIZATION.hand.layout.activeUnderlayStrokeAlpha,
				width: Math.max(
					GAME_CUSTOMIZATION.hand.layout.activeUnderlayStrokeMinWidth,
					cardHeight *
						GAME_CUSTOMIZATION.hand.layout.activeUnderlayStrokeWidthRatio,
				),
			});
		} else {
			this._underlay.fill({
				color: GAME_CUSTOMIZATION.hand.layout.inactiveUnderlayFillColor,
				alpha: GAME_CUSTOMIZATION.hand.layout.inactiveUnderlayFillAlpha,
			});
		}

		if (count === 0) return;

		// --- 3. Spacing Logic ---
		const hoverSpread = cardWidth * Hand.HOVER_SPREAD_PERCENT;
		const hoveredIndex = this._hoveredCard
			? this._cards.indexOf(this._hoveredCard)
			: -1;

		let spreadAmount = 0;
		if (hoveredIndex !== -1) {
			if (hoveredIndex > 0) spreadAmount += hoverSpread;
			if (hoveredIndex < count - 1) spreadAmount += hoverSpread;
		}

		const maxSpan = handLengthAvailable - cardWidth;
		const normalStep = cardWidth * (1 - this._overlapPercent);
		const idealSpan = (count - 1) * normalStep + spreadAmount;

		let step = 0;
		let actualSpan = 0;

		if (idealSpan <= maxSpan) {
			step = normalStep;
			actualSpan = idealSpan;
		} else {
			actualSpan = maxSpan;
			if (count > 1) {
				step = Math.max(0, (maxSpan - spreadAmount) / (count - 1));
			}
		}

		let currentX = -actualSpan / 2;
		const jumpOffset = -(cardHeight * Hand.HOVER_JUMP_PERCENT);

		for (let i = 0; i < count; i++) {
			const card = this._cards[i];

			card.width = cardWidth;
			card.height = cardHeight;
			card.rotation = this._reverseCards ? Math.PI : 0;

			// --- Layout Logic ---
			let nextGap = step;
			if (hoveredIndex !== -1) {
				if (i === hoveredIndex - 1) nextGap += hoverSpread;
				else if (i === hoveredIndex) nextGap += hoverSpread;
			}

			card.x = currentX;

			const isHovered = card === this._hoveredCard;
			const yOffset = isHovered ? jumpOffset : 0;

			card.y = yOffset;
			card.zIndex = isHovered ? count + 1 : i;

			// --- Hit Area Calculation ---
			const bounds = card.getLocalBounds();
			const scaleX = card.scale.x || 1;
			const scaleY = card.scale.y || 1;

			const distToNext = i === count - 1 ? cardWidth : nextGap;
			const screenHitWidth = Math.min(cardWidth, distToNext);

			const localHitWidth = screenHitWidth / scaleX;
			const localYOffset = -yOffset / scaleY;

			card.hitArea = new Rectangle(
				bounds.x,
				bounds.y + localYOffset,
				localHitWidth,
				bounds.height,
			);

			currentX += nextGap;
		}

		this.sortChildren();
	}
}
