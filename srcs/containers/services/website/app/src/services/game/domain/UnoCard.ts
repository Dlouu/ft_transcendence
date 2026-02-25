import { Container, Sprite, Texture } from "pixi.js";
import { CardCode, CardFamily } from "./GameEnums";

export class Card {
	constructor(
		public family: CardFamily,
		public value: CardCode,
	) {}
}

export class UnoCard extends Container {
	private _faceSprite: Sprite;
	private _backSprite: Sprite;

	private _isFaceUp: boolean = false;
	private _card: Card | null = null;

	constructor() {
		super();

		this.sortableChildren = true;

		this._backSprite = new Sprite();
		this._backSprite.anchor.set(0.5);
		this._backSprite.zIndex = 1;

		this._faceSprite = new Sprite();
		this._faceSprite.anchor.set(0.5);
		this._faceSprite.zIndex = 1;

		this.addChild(this._backSprite, this._faceSprite);

		this.visible = false;
		this.reset();
	}

	public reset(): void {
		this.visible = false;
		this.alpha = 1;
		this.position.set(0, 0);
		this.rotation = 0;
		this.scale.set(1);

		this._isFaceUp = false;
		this._card = null;

		this.updateVisibility();
	}

	public get card(): Card | null {
		return this._card;
	}

	public setCard(card: Card | null): void {
		this._card = card;
	}

	public setBackTexture(texture: Texture, card: Card | null = null): void {
		this._card = card;
		this._backSprite.texture = texture;
		this.updateVisibility();
	}

	public setFaceTexture(texture: Texture, card: Card): void {
		this._card = card;
		this._faceSprite.texture = texture;
		this.updateVisibility();
	}

	public setIsFaceUp(isFaceUp: boolean): void {
		this._isFaceUp = isFaceUp;
		this.updateVisibility();
	}

	public setFaceUpCard(texture: Texture, card: Card): void {
		this._card = card;
		this._isFaceUp = true;
		this._faceSprite.texture = texture;
		this.updateVisibility();
	}

	public setFaceBackCard(texture: Texture, card: Card | null = null): void {
		this._card = card;
		this._isFaceUp = false;
		this._backSprite.texture = texture;
		this.updateVisibility();
	}

	private updateVisibility(): void {
		if (this._isFaceUp) {
			this._faceSprite.visible = true;
			this._backSprite.visible = false;
		} else {
			this._faceSprite.visible = false;
			this._backSprite.visible = true;
		}
	}
}
