import { Graphics, Container } from "pixi.js";
import { CardFamily } from "../domain/GameEnums";

export class TableCenterArea extends Container {
    public static readonly MAIN_WIDTH_RATIO: number = 0.35;
    public static readonly MAIN_ASPECT_RATIO: number = 8 / 16;
    public static readonly MAIN_BORDER_DARKEN: number = 0.12;
    public static readonly BACKDROP_WIDTH_RATIO: number = 0.13;
    public static readonly BACKDROP_ASPECT_RATIO: number = 11 / 16;
    public static readonly BACKDROP_BORDER_DARKEN: number = 0.18;

    private _mainColor: string = "#3e295d";
    private _width: number = 0;
    private _height: number = 0;
    private _colors: Record<CardFamily, string> = {
        [CardFamily.ONE]: "#2c7fe5",
        [CardFamily.TWO]: "#26cd00",
        [CardFamily.THREE]: "#ff1249",
        [CardFamily.FOUR]: "#ffc412",
        [CardFamily.WILD]: "#9a9a9a",
    };
    private _mainBackdrop: Graphics;
    private _deckBackdrop: Graphics;
    private _discardBackdrop: Graphics;
    private _backdropColor: string = "#470068";
    private _centerBorderColor: string = "#470068";
    private _centerBorderThickness: number = 6;

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
        return this._colors[family] ?? "#9a9a9a";
    }

    public update(width: number, height: number) {
        this._width = width;
        this._height = height;
        // Main backdrop with border
        const mainW = width * TableCenterArea.MAIN_WIDTH_RATIO;
        const mainH = mainW * TableCenterArea.MAIN_ASPECT_RATIO;
        const mainFill = this.parseHexColor(this._mainColor);
        const mainBorder = this.darkenColor(mainFill, TableCenterArea.MAIN_BORDER_DARKEN);
        const mainRadius = Math.min(mainW, mainH) * 0.12;
        const borderThickness = this._centerBorderThickness;
        const borderFill = this.parseHexColor(this._centerBorderColor);
        const borderRadius = mainRadius + 4;
        this._mainBackdrop.clear();
        // Draw border first (slightly larger)
        this._mainBackdrop
            .roundRect(-mainW/2 - borderThickness/2, -mainH/2 - borderThickness/2, mainW + borderThickness, mainH + borderThickness, borderRadius)
            .fill({ color: borderFill, alpha: 1 })
            .stroke({ width: borderThickness, color: borderFill, alpha: 1 });
        // Draw main area on top
        this._mainBackdrop
            .roundRect(-mainW/2, -mainH/2, mainW, mainH, mainRadius)
            .fill({ color: mainFill, alpha: 1 })
            .stroke({ width: 2, color: mainBorder, alpha: 1 });
        this._mainBackdrop.position.set(width/2, height/2);
        // Deck and discard backdrops (vertical)
        const bdW = width * TableCenterArea.BACKDROP_WIDTH_RATIO;
        const bdH = bdW * TableCenterArea.BACKDROP_ASPECT_RATIO;
        // Swap width and height for vertical orientation
        const verticalW = bdH;
        const verticalH = bdW;
        const bdRadius = Math.min(verticalW, verticalH) * 0.18;
        const bdFill = this.parseHexColor(this._backdropColor);
        const bdBorder = bdFill;
        const offset = width / 9;
        // Deck
        this._deckBackdrop.clear();
        this._deckBackdrop
            .roundRect(-verticalW/2, -verticalH/2, verticalW, verticalH, bdRadius)
            .fill({ color: bdFill, alpha: 0.18 })
            .stroke({ width: 2, color: bdBorder, alpha: 1 });
        this._deckBackdrop.position.set(width/2 - offset, height/2);
        // Discard
        this._discardBackdrop.clear();
        this._discardBackdrop
            .roundRect(-verticalW/2, -verticalH/2, verticalW, verticalH, bdRadius)
            .fill({ color: bdFill, alpha: 0.18 })
            .stroke({ width: 2, color: bdBorder, alpha: 1 });
        this._discardBackdrop.position.set(width/2 + offset, height/2);
    }

    private darkenColor(color: number, amount: number): number {
        const r = (color >> 16) & 0xff;
        const g = (color >> 8) & 0xff;
        const b = color & 0xff;
        const darken = (value: number) => Math.max(0, Math.round(value * (1 - amount)));
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
