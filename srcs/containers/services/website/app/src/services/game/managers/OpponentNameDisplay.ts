import { Container, Text, Sprite, Graphics, Texture, Assets } from "pixi.js";
import { GAME_CUSTOMIZATION } from "../config/gameCustomization";

export class OpponentNameDisplay extends Container {
	private _nameText: Text;
	private _picture: Sprite | null = null;
	private _isVerticalLayout: boolean = true; // true for left/right, false for top
	private _pictureSizePx: number = GAME_CUSTOMIZATION.opponents.names.picture.minSizePx;

	constructor(name: string, pictureUrl?: string, positionType: "top" | "left" | "right" = "top") {
		super();

		this._isVerticalLayout = positionType !== "top";

		const uiFontFamily = this.resolveUiFontFamily();
		const nameConfig = GAME_CUSTOMIZATION.opponents.names;

		this._nameText = new Text({
			text: name,
			style: {
				fill: nameConfig.fillColor,
				fontSize: nameConfig.minFontSizePx,
				fontWeight: "bold",
				align: "center",
				fontFamily: uiFontFamily,
			},
		});

		this._nameText.anchor.set(0.5);
		this._nameText.alpha = nameConfig.alpha;

		this.addChild(this._nameText);

		// Load and add picture if provided
		if (pictureUrl) {
			this.loadPicture(pictureUrl);
		}
	}

	private async loadPicture(pictureUrl: string): Promise<void> {
		try {
			let webPath = pictureUrl.trim();
			const isAbsoluteUrl = /^(https?:)?\/\//i.test(webPath);
			const isInlineOrBlobUrl = /^(data|blob):/i.test(webPath);

			if (!isAbsoluteUrl && !isInlineOrBlobUrl) {
				const publicIndex = webPath.indexOf("/public/");
				if (publicIndex !== -1) {
					// Keep the trailing slash path from "/public/" onward (e.g. "/avatars/a.jpg").
					webPath = webPath.substring(publicIndex + 7);
				}

				if (!webPath.startsWith("/")) {
					webPath = `/${webPath}`;
				}
			}

			const texture = await Assets.load(webPath);
			this._picture = new Sprite(texture);
			this._picture.anchor.set(0.5);
			this._picture.width = this._pictureSizePx;
			this._picture.height = this._pictureSizePx;
			this.addChild(this._picture);
			this.updateLayout();
		} catch (error) {
			console.warn(`Failed to load opponent picture: ${pictureUrl}`, error);
		}
	}

	public updateName(name: string): void {
		this._nameText.text = name;
	}

	public resize(tableWidth: number, tableHeight: number): void {
		const nameConfig = GAME_CUSTOMIZATION.opponents.names;
		const baseFontSize = Math.min(tableWidth, tableHeight) * nameConfig.fontSizeRatio;
		const fontSize = Math.max(
			nameConfig.minFontSizePx,
			Math.min(nameConfig.maxFontSizePx, baseFontSize),
		);

		this._nameText.style.fontSize = fontSize;
		const basePictureSize = Math.min(tableWidth, tableHeight) * nameConfig.picture.sizeRatio;
		this._pictureSizePx = Math.max(
			nameConfig.picture.minSizePx,
			Math.min(nameConfig.picture.maxSizePx, basePictureSize),
		);

		if (this._picture) {
			this._picture.width = this._pictureSizePx;
			this._picture.height = this._pictureSizePx;

			this.updateLayout();
		}
	}

	private updateLayout(): void {
		if (!this._picture) return;

		const nameConfig = GAME_CUSTOMIZATION.opponents.names;
		const spacing = nameConfig.picture.spacing;
		const pictureSize = this._picture.width;

		const nameHeight = this._nameText.height;

		if (this._isVerticalLayout) {
			// For left/right: name below picture
			// Position elements centered around (0,0)
			this._picture.position.set(0, -(nameHeight + spacing) / 2);
			this._nameText.position.set(0, (pictureSize + spacing) / 2);
			this._nameText.position.x = 0;
			this._picture.position.x = 0;
		} else {
			// For top: picture to the left of name
			// Position elements centered around (0,0)
			this._picture.position.set(-(this._nameText.width + spacing) / 2, 0);
			this._nameText.position.set((pictureSize + spacing) / 2, 0);
			this._nameText.position.y = 0;
			this._picture.position.y = 0;
		}
	}

	private resolveUiFontFamily(): string {
		const cssVariable = GAME_CUSTOMIZATION.opponents.names.fontCssVariable;
		const fallback = GAME_CUSTOMIZATION.opponents.names.fontFallback;

		if (typeof window !== "undefined") {
			const value = getComputedStyle(document.documentElement)
				.getPropertyValue(cssVariable)
				.trim();
			if (value) {
				return value;
			}
		}

		return fallback;
	}

	public destroy(): void {
		this._nameText.destroy();
		if (this._picture) {
			this._picture.destroy();
		}
		if (this.parent) {
			this.parent.removeChild(this);
		}
		super.destroy();
	}
}
