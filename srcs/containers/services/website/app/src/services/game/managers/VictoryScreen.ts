import { Container, Graphics, Text } from "pixi.js";
import { GameWinDto } from "../dto/game-win.dto";
import { GAME_CUSTOMIZATION } from "../config/gameCustomization";

export class VictoryScreen extends Container {
	private static readonly UI_FONT_CSS_VARIABLE =
		GAME_CUSTOMIZATION.victory.fontCssVariable;
	private static readonly UI_FONT_FALLBACK =
		GAME_CUSTOMIZATION.victory.fontFallback;
	private static readonly DEFAULT_BUTTON_LABEL =
		GAME_CUSTOMIZATION.victory.labels.defaultButton;
	private static readonly HOME_PATH =
		GAME_CUSTOMIZATION.victory.labels.homePath;
	private static readonly PANEL_WIDTH_RATIO =
		GAME_CUSTOMIZATION.victory.ratios.panelWidth;
	private static readonly PANEL_ASPECT_RATIO =
		GAME_CUSTOMIZATION.victory.ratios.panelAspect;
	private static readonly PANEL_CORNER_RADIUS_RATIO =
		GAME_CUSTOMIZATION.victory.ratios.panelCornerRadius;
	private static readonly TITLE_TOP_RATIO =
		GAME_CUSTOMIZATION.victory.ratios.titleTop;
	private static readonly STATS_TOP_RATIO =
		GAME_CUSTOMIZATION.victory.ratios.statsTop;
	private static readonly BUTTON_BOTTOM_RATIO =
		GAME_CUSTOMIZATION.victory.ratios.buttonBottom;
	private static readonly TITLE_FONT_RATIO =
		GAME_CUSTOMIZATION.victory.ratios.titleFont;
	private static readonly STATS_FONT_RATIO =
		GAME_CUSTOMIZATION.victory.ratios.statsFont;
	private static readonly BUTTON_WIDTH_RATIO =
		GAME_CUSTOMIZATION.victory.ratios.buttonWidth;
	private static readonly BUTTON_HEIGHT_RATIO =
		GAME_CUSTOMIZATION.victory.ratios.buttonHeight;
	private static readonly BUTTON_CORNER_RADIUS_RATIO =
		GAME_CUSTOMIZATION.victory.ratios.buttonCornerRadius;
	private static readonly BUTTON_LABEL_FONT_RATIO =
		GAME_CUSTOMIZATION.victory.ratios.buttonLabelFont;

	private _overlay: Graphics;
	private _panel: Graphics;
	private _title: Text;
	private _gameStatsLabel: Text;
	private _button: Container;
	private _buttonBackground: Graphics;
	private _buttonLabel: Text;
	private _buttonText: string;

	private _isButtonAnimating: boolean = false;
	private _onActionClick?: () => void;

	constructor(
		onActionClick?: () => void,
		buttonText: string = VictoryScreen.DEFAULT_BUTTON_LABEL,
	) {
		super();

		this._onActionClick = onActionClick;
		this._buttonText = buttonText;
		const uiFontFamily = this.resolveUiFontFamily();

		this._overlay = new Graphics();
		this._overlay.eventMode = "static";

		this._panel = new Graphics();

		this._title = new Text({
			text: GAME_CUSTOMIZATION.victory.labels.victory,
			style: {
				fill: GAME_CUSTOMIZATION.victory.colors.titleText,
				fontSize: GAME_CUSTOMIZATION.victory.sizes.titleFontPx,
				fontWeight: "bold",
				align: "center",
				fontFamily: uiFontFamily,
			},
		});
		this._title.anchor.set(0.5, 0);

		this._gameStatsLabel = new Text({
			text: "",
			style: {
				fill: GAME_CUSTOMIZATION.victory.colors.statsText,
				fontSize: GAME_CUSTOMIZATION.victory.sizes.statsFontPx,
				align: "center",
				fontFamily: uiFontFamily,
			},
		});
		this._gameStatsLabel.anchor.set(0.5, 0);

		this._buttonBackground = new Graphics();
		this._buttonLabel = new Text({
			text: this._buttonText,
			style: {
				fill: GAME_CUSTOMIZATION.victory.colors.buttonLabelText,
				fontSize: GAME_CUSTOMIZATION.victory.sizes.buttonFontPx,
				fontWeight: "bold",
				align: "center",
				fontFamily: uiFontFamily,
			},
		});
		this._buttonLabel.anchor.set(0.5);

		this._button = new Container();
		this._button.eventMode = "static";
		this._button.cursor = "pointer";
		this._button.on("pointertap", () => this.animatePlaceholderButton());
		this._button.addChild(this._buttonBackground);
		this._button.addChild(this._buttonLabel);

		this.addChild(this._overlay);
		this.addChild(this._panel);
		this.addChild(this._title);
		this.addChild(this._gameStatsLabel);
		this.addChild(this._button);

		this.visible = false;
	}

	public setButtonText(text: string): void {
		this._buttonText = text;
		this._buttonLabel.text = this._buttonText;
	}

	public show(dto: GameWinDto, isVictory: boolean): void {
		this._title.text = isVictory
			? GAME_CUSTOMIZATION.victory.labels.victory
			: GAME_CUSTOMIZATION.victory.labels.defeat;
		this._gameStatsLabel.text = `Duration: ${this.formatDuration(dto.gameDuration)}   •   Turns: ${dto.turnNbr}`;

		this.visible = true;
		this.alpha = 1;
		this.eventMode = "static";
	}

	public hide(): void {
		this.visible = false;
		this.eventMode = "none";
	}

	public resize(width: number, height: number): void {
		const panelWidth = width * VictoryScreen.PANEL_WIDTH_RATIO;
		const panelHeight = panelWidth / VictoryScreen.PANEL_ASPECT_RATIO;
		const panelMinDimension = Math.min(panelWidth, panelHeight);
		const panelLeft = (width - panelWidth) / 2;
		const panelTop = (height - panelHeight) / 2;

		this._overlay.clear();
		this._overlay.rect(0, 0, width, height).fill({
			color: GAME_CUSTOMIZATION.victory.colors.overlay,
			alpha: GAME_CUSTOMIZATION.victory.alphas.overlay,
		});

		this._panel.clear();
		this._panel
			.roundRect(
				panelLeft,
				panelTop,
				panelWidth,
				panelHeight,
				panelMinDimension * VictoryScreen.PANEL_CORNER_RADIUS_RATIO,
			)
			.fill({
				color: GAME_CUSTOMIZATION.victory.colors.panel,
				alpha: GAME_CUSTOMIZATION.victory.alphas.panel,
			})
			.stroke({
				width: GAME_CUSTOMIZATION.victory.sizes.panelStrokeWidth,
				color: GAME_CUSTOMIZATION.victory.colors.panelStroke,
				alpha: GAME_CUSTOMIZATION.victory.alphas.panelStroke,
			});

		this._title.style.fontSize = panelWidth * VictoryScreen.TITLE_FONT_RATIO;
		this._title.position.set(
			width / 2,
			panelTop + panelHeight * VictoryScreen.TITLE_TOP_RATIO,
		);

		this._gameStatsLabel.style.fontSize =
			panelWidth * VictoryScreen.STATS_FONT_RATIO;
		this._gameStatsLabel.position.set(
			width / 2,
			panelTop + panelHeight * VictoryScreen.STATS_TOP_RATIO,
		);

		const buttonWidth = panelWidth * VictoryScreen.BUTTON_WIDTH_RATIO;
		const buttonHeight = panelHeight * VictoryScreen.BUTTON_HEIGHT_RATIO;
		this.drawButton(buttonWidth, buttonHeight);
		this._button.position.set(
			width / 2,
			panelTop + panelHeight - panelHeight * VictoryScreen.BUTTON_BOTTOM_RATIO,
		);
	}

	private drawButton(width: number, height: number): void {
		this._buttonBackground.clear();
		this._buttonBackground
			.roundRect(
				-width / 2,
				-height / 2,
				width,
				height,
				Math.min(width, height) * VictoryScreen.BUTTON_CORNER_RADIUS_RATIO,
			)
			.fill({ color: GAME_CUSTOMIZATION.victory.colors.buttonFill, alpha: 1 })
			.stroke({
				width: GAME_CUSTOMIZATION.victory.sizes.buttonStrokeWidth,
				color: GAME_CUSTOMIZATION.victory.colors.buttonStroke,
				alpha: GAME_CUSTOMIZATION.victory.alphas.buttonStroke,
			});

		this._buttonLabel.style.fontSize =
			Math.min(width, height) * VictoryScreen.BUTTON_LABEL_FONT_RATIO;
		this._buttonLabel.position.set(0, 0);
	}

	private animatePlaceholderButton(): void {
		if (this._isButtonAnimating) {
			return;
		}

		this._isButtonAnimating = true;
		this._button.scale.set(GAME_CUSTOMIZATION.victory.buttonPressedScale);
		this._button.alpha = GAME_CUSTOMIZATION.victory.alphas.buttonPressed;

		window.setTimeout(() => {
			this._button.scale.set(1);
			this._button.alpha = 1;
			this._isButtonAnimating = false;

			if (this._onActionClick) {
				this._onActionClick();
				return;
			}

			if (typeof window !== "undefined") {
				window.location.assign(VictoryScreen.HOME_PATH);
			}
		}, GAME_CUSTOMIZATION.victory.buttonAnimationDurationMs);
	}

	private formatDuration(rawDuration: number): string {
		const safeValue = Math.max(0, Math.floor(rawDuration));
		const digits = safeValue.toString().padStart(8, "0").slice(-8);

		const days = Number(digits.slice(0, 2));
		const hours = Number(digits.slice(2, 4));
		const minutes = Number(digits.slice(4, 6));
		const seconds = Number(digits.slice(6, 8));

		const parts: string[] = [];

		if (days > 0) {
			parts.push(`${days}d`);
		}
		if (hours > 0 || days > 0) {
			parts.push(`${hours}h`);
		}
		if (minutes > 0 || hours > 0 || days > 0) {
			parts.push(`${minutes}m`);
		}

		parts.push(`${seconds}s`);

		return parts.join(" ");
	}

	private resolveUiFontFamily(): string {
		if (typeof window === "undefined" || typeof document === "undefined") {
			return VictoryScreen.UI_FONT_FALLBACK;
		}

		const cssValue = window
			.getComputedStyle(document.documentElement)
			.getPropertyValue(VictoryScreen.UI_FONT_CSS_VARIABLE)
			.trim();

		if (!cssValue) {
			return VictoryScreen.UI_FONT_FALLBACK;
		}

		return (
			cssValue
				.split(",")[0]
				.trim()
				.replace(/^['\"]|['\"]$/g, "") || VictoryScreen.UI_FONT_FALLBACK
		);
	}
}
