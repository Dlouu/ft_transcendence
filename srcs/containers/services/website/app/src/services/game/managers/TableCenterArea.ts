import { Graphics, Container } from "pixi.js";
import { CardFamily } from "../domain/GameEnums";
import { GAME_CUSTOMIZATION } from "../config/gameCustomization";
import { TableViewport } from "../layout/TableViewport";

export class TableCenterArea extends Container {
	public static readonly MAIN_WIDTH_RATIO: number =
		GAME_CUSTOMIZATION.centerArea.mainWidthRatio;
	public static readonly MAIN_ASPECT_RATIO: number =
		GAME_CUSTOMIZATION.centerArea.mainAspectRatio;
	public static readonly MAIN_BORDER_DARKEN: number =
		GAME_CUSTOMIZATION.centerArea.mainBorderDarken;
	public static readonly BACKDROP_WIDTH_RATIO: number =
		GAME_CUSTOMIZATION.centerArea.backdropWidthRatio;
	public static readonly BACKDROP_ASPECT_RATIO: number =
		GAME_CUSTOMIZATION.centerArea.backdropAspectRatio;

	private _mainColor: string = GAME_CUSTOMIZATION.centerArea.defaultMainColor;
	private _width: number = 0;
	private _height: number = 0;
	private _colors: Record<CardFamily, string> = {
		...GAME_CUSTOMIZATION.centerArea.defaultFamilyColors,
	};
	private _mainBackdrop: Graphics;
	private _deckBackdrop: Graphics;
	private _discardBackdrop: Graphics;
	private _backdropColor: string =
		GAME_CUSTOMIZATION.centerArea.defaultBackdropColor;
	private _centerBorderColor: string =
		GAME_CUSTOMIZATION.centerArea.defaultCenterBorderColor;
	private _centerBorderThickness: number =
		GAME_CUSTOMIZATION.centerArea.centerBorderThickness;

	constructor() {
		super();
		this._mainBackdrop = new Graphics();
		this._deckBackdrop = new Graphics();
		this._discardBackdrop = new Graphics();
		this.addChild(this._mainBackdrop);
		this.addChild(this._deckBackdrop);
		this.addChild(this._discardBackdrop);
	}

	public setMainColor(color: string) {
		if (this._mainColor === color) return;
		this._mainColor = color;
		if (this._width > 0 && this._height > 0) {
			this.update(this._width, this._height);
		}
	}

	public setColors(colors: Partial<Record<CardFamily, string>>) {
		this._colors = {
			...this._colors,
			...colors,
		};
	}

	public getColorForFamily(family: CardFamily): string {
		return (
			this._colors[family] ?? GAME_CUSTOMIZATION.centerArea.fallbackFamilyColor
		);
	}

	public update(width: number, height: number, viewport?: TableViewport) {
		this._width = width;
		this._height = height;

		const tableWidth = viewport?.tableWidth ?? width;
		const tableHeight = viewport?.tableHeight ?? height;
		const offsetX = viewport?.offsetX ?? 0;
		const offsetY = viewport?.offsetY ?? 0;
		const centerX = viewport?.centerX ?? width / 2;
		const centerY = viewport?.centerY ?? height / 2;

		const mainW = tableWidth * TableCenterArea.MAIN_WIDTH_RATIO;
		const mainH = mainW * TableCenterArea.MAIN_ASPECT_RATIO;
		const mainFill = this.parseHexColor(this._mainColor);
		const mainBorder = this.darkenColor(
			mainFill,
			TableCenterArea.MAIN_BORDER_DARKEN,
		);
		const mainRadius =
			Math.min(mainW, mainH) *
			GAME_CUSTOMIZATION.centerArea.mainCornerRadiusRatio;
		const borderThickness = this._centerBorderThickness;
		const borderFill = this.parseHexColor(this._centerBorderColor);
		const borderRadius =
			mainRadius + GAME_CUSTOMIZATION.centerArea.borderRadiusExtra;

		this._mainBackdrop.clear();
		this._mainBackdrop
			.roundRect(
				-mainW / 2 - borderThickness / 2,
				-mainH / 2 - borderThickness / 2,
				mainW + borderThickness,
				mainH + borderThickness,
				borderRadius,
			)
			.fill({ color: borderFill, alpha: 1 })
			.stroke({ width: borderThickness, color: borderFill, alpha: 1 });

		this._mainBackdrop
			.roundRect(-mainW / 2, -mainH / 2, mainW, mainH, mainRadius)
			.fill({ color: mainFill, alpha: 1 })
			.stroke({
				width: GAME_CUSTOMIZATION.centerArea.mainStrokeWidth,
				color: mainBorder,
				alpha: 1,
			});
		this._mainBackdrop.position.set(centerX, centerY);

		const bdW = tableWidth * TableCenterArea.BACKDROP_WIDTH_RATIO;
		const bdH = bdW * TableCenterArea.BACKDROP_ASPECT_RATIO;
		const verticalW = bdH;
		const verticalH = bdW;
		const bdRadius =
			Math.min(verticalW, verticalH) *
			GAME_CUSTOMIZATION.centerArea.backdropCornerRadiusRatio;
		const bdFill = this.parseHexColor(this._backdropColor);
		const offset =
			tableWidth / GAME_CUSTOMIZATION.centerArea.deckDiscardOffsetDivisor;

		this._deckBackdrop.clear();
		this._deckBackdrop
			.roundRect(-verticalW / 2, -verticalH / 2, verticalW, verticalH, bdRadius)
			.fill({
				color: bdFill,
				alpha: GAME_CUSTOMIZATION.centerArea.backdropFillAlpha,
			})
			.stroke({
				width: GAME_CUSTOMIZATION.centerArea.backdropStrokeWidth,
				color: bdFill,
				alpha: 1,
			});
		this._deckBackdrop.position.set(offsetX + tableWidth / 2 - offset, offsetY + tableHeight / 2);

		this._discardBackdrop.clear();
		this._discardBackdrop
			.roundRect(-verticalW / 2, -verticalH / 2, verticalW, verticalH, bdRadius)
			.fill({
				color: bdFill,
				alpha: GAME_CUSTOMIZATION.centerArea.backdropFillAlpha,
			})
			.stroke({
				width: GAME_CUSTOMIZATION.centerArea.backdropStrokeWidth,
				color: bdFill,
				alpha: 1,
			});
		this._discardBackdrop.position.set(offsetX + tableWidth / 2 + offset, offsetY + tableHeight / 2);
	}

	private darkenColor(color: number, amount: number): number {
		const r = (color >> 16) & 0xff;
		const g = (color >> 8) & 0xff;
		const b = color & 0xff;
		const darken = (value: number) =>
			Math.max(0, Math.round(value * (1 - amount)));
		return (darken(r) << 16) + (darken(g) << 8) + darken(b);
	}

	private parseHexColor(color: string): number {
		if (color.startsWith("#")) {
			return parseInt(color.slice(1), 16);
		}
		if (color.startsWith("0x")) {
			return parseInt(color.slice(2), 16);
		}
		return parseInt(color, 16);
	}
}
