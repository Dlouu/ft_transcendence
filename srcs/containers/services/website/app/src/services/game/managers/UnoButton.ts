import { Container, Graphics, Text } from "pixi.js";
import { GAME_CUSTOMIZATION } from "../config/gameCustomization";

export class UnoButton extends Container {
	private static readonly BASE_WIDTH =
		GAME_CUSTOMIZATION.table.unoButton.baseWidth;
	private static readonly ASPECT_RATIO =
		GAME_CUSTOMIZATION.table.unoButton.aspectRatio;
	private static readonly FILL_COLOR =
		GAME_CUSTOMIZATION.table.unoButton.fillColor;
	private static readonly FONT_CSS_VARIABLE =
		GAME_CUSTOMIZATION.table.unoButton.fontCssVariable;
	private static readonly FONT_FALLBACK =
		GAME_CUSTOMIZATION.table.unoButton.fontFallback;

	private _background: Graphics;
	private _label: Text;
	private _isClickable: boolean;

	constructor(onClick?: () => void) {
		super();

		this._isClickable = typeof onClick === "function";
		this._background = new Graphics();
		this._label = new Text({
			text: "UNO",
			style: {
				fill: GAME_CUSTOMIZATION.table.unoButton.labelFillColor,
				fontSize: GAME_CUSTOMIZATION.table.unoButton.labelFontSize,
				fontWeight: "bold",
				align: "center",
				fontFamily: this.resolveFontFamily(),
			},
		});
		this._label.anchor.set(0.5);

		if (onClick) {
			this.on("pointertap", onClick);
		}

		this.addChild(this._background);
		this.addChild(this._label);

		this.draw();
		this.setVisible(false);
	}

	public setVisible(isVisible: boolean): void {
		this.visible = isVisible;

		if (isVisible && this._isClickable) {
			this.eventMode = "static";
			this.cursor = "pointer";
			return;
		}

		this.eventMode = "none";
		this.cursor = "default";
	}

	public setText(text: string): void {
		this._label.text = text;
	}

	public resize(
		width: number,
		height: number,
		yRatio: number,
		widthRatio: number,
	): void {
		const targetWidth = width * widthRatio;
		const scale =
			UnoButton.BASE_WIDTH > 0 ? targetWidth / UnoButton.BASE_WIDTH : 1;

		this.position.set(width / 2, height * yRatio);
		this.scale.set(scale);
	}

	private draw(): void {
		const width = UnoButton.BASE_WIDTH;
		const height = width / UnoButton.ASPECT_RATIO;
		const cornerRadius =
			Math.min(width, height) *
			GAME_CUSTOMIZATION.table.unoButton.cornerRadiusRatio;

		this._background.clear();
		this._background
			.roundRect(-width / 2, -height / 2, width, height, cornerRadius)
			.fill({ color: UnoButton.FILL_COLOR, alpha: 1 })
			.stroke({
				width: GAME_CUSTOMIZATION.table.unoButton.strokeWidth,
				color: GAME_CUSTOMIZATION.table.unoButton.strokeColor,
				alpha: 1,
			});
	}

	private resolveFontFamily(): string {
		if (typeof window === "undefined" || typeof document === "undefined") {
			return UnoButton.FONT_FALLBACK;
		}

		const cssValue = window
			.getComputedStyle(document.documentElement)
			.getPropertyValue(UnoButton.FONT_CSS_VARIABLE)
			.trim();

		if (!cssValue) {
			return UnoButton.FONT_FALLBACK;
		}

		return (
			cssValue
				.split(",")[0]
				.trim()
				.replace(/^['\"]|['\"]$/g, "") || UnoButton.FONT_FALLBACK
		);
	}
}
