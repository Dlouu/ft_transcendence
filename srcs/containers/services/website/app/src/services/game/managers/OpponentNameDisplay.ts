import { Container, Text, Sprite, Graphics, Texture, Assets } from "pixi.js";
import { GAME_CUSTOMIZATION } from "../config/gameCustomization";

export class OpponentNameDisplay extends Container {
	private _nameText: Text;
	private _picture: Sprite | null = null;
	private _isVerticalLayout: boolean = true; // true for left/right, false for top

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
            // Normalize the path to be web-accessible
            // Extract the part after "public/" to get the URL path
            let webPath = pictureUrl;
            const publicIndex = pictureUrl.indexOf("/public/");
            if (publicIndex !== -1) {
                webPath = pictureUrl.substring(publicIndex + 7); // "/public/".length = 8, but we skip the 'p'
            }

            // Ensure it starts with /
            if (!webPath.startsWith("/")) {
                webPath = "/" + webPath;
            }

            const texture = await Assets.load(webPath);
            this._picture = new Sprite(texture);
            this._picture.anchor.set(0.5);
			this.addChild(this._picture);
			this.updateLayout();
			console.log("LOAD PICTURE YEAH !");
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

		if (this._picture) {
			const basePictureSize = Math.min(tableWidth, tableHeight) * nameConfig.picture.sizeRatio;
			const pictureSize = Math.max(
				nameConfig.picture.minSizePx,
				Math.min(nameConfig.picture.maxSizePx, basePictureSize),
			);

			this._picture.width = pictureSize;
			this._picture.height = pictureSize;

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
			// For left/right: picture below name
			// Position elements centered around (0,0)
			this._nameText.position.set(0, -(pictureSize + spacing) / 2);
			this._picture.position.set(0, (nameHeight + spacing) / 2);
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
