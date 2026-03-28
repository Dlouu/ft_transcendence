import { Container } from "pixi.js";
import { UnoCard } from "./UnoCard";
import { GAME_CUSTOMIZATION } from "../config/gameCustomization";
import { TableViewport } from "../layout/TableViewport";

export class CardPile extends Container {
	private _card: UnoCard | null = null;

	private _isInteractive: boolean = false; // Only the deck should be interactive
	private _onPileClick?: () => void;

	// Dimensions
	private _canvasWidth: number = 0;
	private _canvasHeight: number = 0;
	private _tableWidth: number = 0;
	private _tableHeight: number = 0;

	constructor(
		card: UnoCard | null = null,
		isVisible: boolean = false,
		isInteractive: boolean = false,
		onPileClick?: () => void,
	) {
		super();
		this.visible = isVisible;
		this._onPileClick = onPileClick;
		this.setInteractivity(isInteractive);
		this.setCard(card);
	}

	public get card(): UnoCard | null {
		return this._card;
	}

	public setCard(card: UnoCard | null): void {
		if (this._card === card) return;

		if (this._card) {
			this.removeChild(this._card);
		}

		this._card = card;

		if (this._card) {
			this.addChild(this._card);
			this.updateLayout();
		}
	}

	public setVisible(isVisible: boolean): void {
		this.visible = isVisible;
	}

	public resize(width: number, height: number, viewport?: TableViewport): void {
		this._canvasWidth = width;
		this._canvasHeight = height;
		this._tableWidth = viewport?.tableWidth ?? width;
		this._tableHeight = viewport?.tableHeight ?? height;
		this.updateLayout();
	}

	public setInteractivity(isInteractive: boolean): void {
		this._isInteractive = isInteractive;
		this.eventMode = isInteractive ? "static" : "none";
		this.cursor = isInteractive ? "pointer" : "default";

		this.off("pointerdown", this.onPileClick, this);
		this.off("pointerenter", this.onPileHover, this);
		this.off("pointerleave", this.onPileOut, this);

		if (isInteractive) {
			this.on("pointerdown", this.onPileClick, this);
			this.on("pointerenter", this.onPileHover, this);
			this.on("pointerleave", this.onPileOut, this);
		}
	}

	private onPileClick(): void {
		if (this._onPileClick && this._isInteractive) {
			this._onPileClick();
		}
	}

	private onPileHover(): void {
		// Placeholder: Hover visual effect
		this.alpha = GAME_CUSTOMIZATION.pile.hoverAlpha;
	}

	private onPileOut(): void {
		// Placeholder: Reset hover effect
		this.alpha = GAME_CUSTOMIZATION.pile.defaultAlpha;
	}

	private updateLayout() {
		if (this._card) {
			if (this._tableWidth > 0 && this._tableHeight > 0) {
				const cardHeight =
					this._tableHeight * GAME_CUSTOMIZATION.pile.cardHeightRatio;
				const cardRatio = GAME_CUSTOMIZATION.pile.cardRatio;
				const cardWidth = cardHeight * cardRatio;

				this._card.width = cardWidth;
				this._card.height = cardHeight;
			}
			this._card.position.set(0, 0);
		}
	}
}
