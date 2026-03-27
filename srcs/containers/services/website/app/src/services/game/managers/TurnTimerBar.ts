import { Container, Graphics, Ticker } from "pixi.js";
import { GAME_CUSTOMIZATION } from "../config/gameCustomization";
import { TableViewport } from "../layout/TableViewport";

export class TurnTimerBar extends Container {
	private _background: Graphics;
	private _fill: Graphics;
	private _barWidth: number = 0;
	private _barHeight: number = 0;
	private _durationMs: number = GAME_CUSTOMIZATION.table.turnTimer.durationMs;
	private _startedAtMs: number = 0;
	private _isRunning: boolean = false;

	constructor() {
		super();

		this._background = new Graphics();
		this._fill = new Graphics();

		this.addChild(this._background);
		this.addChild(this._fill);
		this.visible = false;
	}

	public resize(
		tableWidth: number,
		tableHeight: number,
		viewport?: TableViewport,
	): void {
		const safeTableWidth = viewport?.tableWidth ?? tableWidth;
		const safeTableHeight = viewport?.tableHeight ?? tableHeight;
		const centerX = viewport?.centerX ?? tableWidth / 2;
		const centerY = viewport?.centerY ?? tableHeight / 2;

		this._barWidth =
			safeTableWidth * GAME_CUSTOMIZATION.centerArea.mainWidthRatio;
		this._barHeight = Math.max(
			GAME_CUSTOMIZATION.table.turnTimer.minHeightPx,
			safeTableHeight * GAME_CUSTOMIZATION.table.turnTimer.heightRatio,
		);

		const mainHeight =
			this._barWidth * GAME_CUSTOMIZATION.centerArea.mainAspectRatio;
		const yOffset =
			safeTableHeight * GAME_CUSTOMIZATION.table.turnTimer.offsetYRatio;

		this.position.set(
			centerX,
			centerY + mainHeight / 2 + yOffset + this._barHeight / 2,
		);

		this.drawBackground();
		this.drawFill(this._isRunning ? this.getCurrentFillWidth() : 0);
	}

	public start(durationMs?: number): void {
		const nextDuration = durationMs ?? this._durationMs;
		if (nextDuration <= 0) {
			this.stop(true);
			return;
		}

		this._durationMs = nextDuration;
		this._startedAtMs = performance.now();
		this.visible = true;
		this._isRunning = true;
		this.drawFill(this._barWidth);

		Ticker.shared.remove(this.onTick, this);
		Ticker.shared.add(this.onTick, this);
	}

	public stop(hide: boolean = true): void {
		if (this._isRunning) {
			Ticker.shared.remove(this.onTick, this);
		}
		this._isRunning = false;

		if (hide) {
			this.visible = false;
			this.drawFill(0);
		}
	}

	public destroy(): void {
		this.stop();
		super.destroy({ children: true });
	}

	private onTick(): void {
		const fillWidth = this.getCurrentFillWidth();
		this.drawFill(fillWidth);

		if (fillWidth <= 0) {
			this.stop(false);
		}
	}

	private getCurrentFillWidth(): number {
		if (!this._isRunning || this._durationMs <= 0) {
			return 0;
		}

		const elapsed = performance.now() - this._startedAtMs;
		const progress = Math.min(1, Math.max(0, elapsed / this._durationMs));
		return this._barWidth * (1 - progress);
	}

	private drawBackground(): void {
		this._background.clear();
		this._background
			.roundRect(
				-this._barWidth / 2,
				-this._barHeight / 2,
				this._barWidth,
				this._barHeight,
				this._barHeight * GAME_CUSTOMIZATION.table.turnTimer.cornerRadiusRatio,
			)
			.fill({
				color: this.parseHexColor(
					GAME_CUSTOMIZATION.table.turnTimer.backgroundColor,
				),
				alpha: GAME_CUSTOMIZATION.table.turnTimer.backgroundAlpha,
			});
	}

	private drawFill(fillWidth: number): void {
		const safeFillWidth = Math.max(0, Math.min(this._barWidth, fillWidth));
		this._fill.clear();
		if (safeFillWidth <= 0) {
			return;
		}

		this._fill
			.roundRect(
				-this._barWidth / 2,
				-this._barHeight / 2,
				safeFillWidth,
				this._barHeight,
				this._barHeight * GAME_CUSTOMIZATION.table.turnTimer.cornerRadiusRatio,
			)
			.fill({
				color: this.parseHexColor(GAME_CUSTOMIZATION.table.turnTimer.fillColor),
				alpha: 1,
			});
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
