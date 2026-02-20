import { Container, Sprite, Texture } from "pixi.js";

export class UnoCard extends Container {
	private _faceSprite: Sprite;
	private _backSprite: Sprite;
	private _shadowSprite: Sprite;

	private _isFaceUp: boolean = false;
	private _shadowActive: boolean = false;

	private _shadowOffsetX: number = 0;
	private _shadowOffsetY: number = 0;

	constructor() {
		super();

		this.sortableChildren = true;

		this._shadowSprite = new Sprite();
		this._shadowSprite.anchor.set(0.5);
		this._shadowSprite.tint = "#000000";
		this._shadowSprite.alpha = 0.4;

		this._shadowSprite.position.set(this._shadowOffsetX, this._shadowOffsetY);

		this._shadowSprite.zIndex = 0;

		this._backSprite = new Sprite();
		this._backSprite.anchor.set(0.5);
		this._backSprite.zIndex = 1;

		this._faceSprite = new Sprite();
		this._faceSprite.anchor.set(0.5);
		this._faceSprite.zIndex = 1;

		this.addChild(this._shadowSprite, this._backSprite, this._faceSprite);

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

		this.setShadowOffset(5, 5);
		this.setShadow(false);

		this.updateVisibility();
	}

	public setShadowOffset(x: number, y: number): void {
		this._shadowOffsetX = x;
		this._shadowOffsetY = y;
		this._shadowSprite.position.set(x, y);
	}

	public setBackTexture(texture: Texture): void {
		this._backSprite.texture = texture;
		this.updateVisibility();
	}

	public setFaceTexture(texture: Texture): void {
		this._faceSprite.texture = texture;
		this.updateVisibility();
	}

	public setShadow(isActive: boolean): void {
		this._shadowActive = isActive;
		this.updateVisibility();
	}

	public setIsFaceUp(isFaceUp: boolean): void {
		this._isFaceUp = isFaceUp;
		this.updateVisibility();
	}

	public setFaceUpCard(texture: Texture, isShadow: boolean): void {
		this._shadowActive = isShadow;
		this._isFaceUp = true;
		this._faceSprite.texture = texture;
		this.updateVisibility();
	}

	public setFaceBackCard(texture: Texture, isShadow: boolean): void {
		this._shadowActive = isShadow;
		this._isFaceUp = false;
		this._backSprite.texture = texture;
		this.updateVisibility();
	}

	private updateVisibility(): void {
		if (this._isFaceUp) {
			this._faceSprite.visible = true;
			this._backSprite.visible = false;
			this._shadowSprite.texture = this._faceSprite.texture;
		} else {
			this._faceSprite.visible = false;
			this._backSprite.visible = true;
			this._shadowSprite.texture = this._backSprite.texture;
		}

		this._shadowSprite.visible = this._shadowActive;
	}
}
