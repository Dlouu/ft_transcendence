import { Container, Graphics, Text } from "pixi.js";
import { GameWinDto } from "../dto/game-win.dto";

export class VictoryScreen extends Container
{
    private _panelWidthRatio: number = 0.76;
    private _panelAspectRatio: number = 16 / 9;
    private _panelCornerRadiusRatio: number = 0.03;

    private _titleTopRatio: number = 0.06;
    private _statsTopRatio: number = 0.24;
    private _buttonBottomRatio: number = 0.1;

    private _titleFontRatio: number = 0.07;

    private _statsFontRatio: number = 0.032;

    private _buttonWidthRatio: number = 0.32;
    private _buttonHeightRatio: number = 0.12;
    private _buttonCornerRadiusRatio: number = 0.2;
    private _buttonLabelFontRatio: number = 0.36;

    private _overlay: Graphics;
    private _panel: Graphics;
    private _title: Text;
    private _gameStatsLabel: Text;
    private _button: Container;
    private _buttonBackground: Graphics;
    private _buttonLabel: Text;

    private _isButtonAnimating: boolean = false;
    private _onActionClick?: () => void;

    constructor(onActionClick?: () => void)
    {
        super();

        this._onActionClick = onActionClick;

        this._overlay = new Graphics();
        this._overlay.eventMode = "static";

        this._panel = new Graphics();

        this._title = new Text("VICTORY", {
            fill: 0xffffff,
            fontSize: 56,
            fontWeight: "bold",
            align: "center",
        });
        this._title.anchor.set(0.5, 0);

        this._gameStatsLabel = new Text("", {
            fill: 0xd5cfff,
            fontSize: 19,
            align: "center",
        });
        this._gameStatsLabel.anchor.set(0.5, 0);

        this._buttonBackground = new Graphics();
        this._buttonLabel = new Text("Continue", {
            fill: 0xffffff,
            fontSize: 24,
            fontWeight: "bold",
            align: "center",
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

    public show(dto: GameWinDto, isVictory: boolean): void
    {
        this._title.text = isVictory ? "VICTORY" : "DEFEAT";
        this._gameStatsLabel.text = `Duration: ${this.formatDuration(dto.gameDuration)}   •   Turns: ${dto.turnNbr}`;

        this.visible = true;
        this.alpha = 1;
        this.eventMode = "static";
    }

    public hide(): void
    {
        this.visible = false;
        this.eventMode = "none";
    }

    public resize(width: number, height: number): void
    {
        const panelWidth = width * this._panelWidthRatio;
        const panelHeight = panelWidth / this._panelAspectRatio;
        const panelMinDimension = Math.min(panelWidth, panelHeight);
        const panelLeft = (width - panelWidth) / 2;
        const panelTop = (height - panelHeight) / 2;

        this._overlay.clear();
        this._overlay.beginFill(0x0f0820, 0.7);
        this._overlay.drawRect(0, 0, width, height);
        this._overlay.endFill();

        this._panel.clear();
        this._panel.lineStyle(3, 0xffffff, 0.2);
        this._panel.beginFill(0x2b1e44, 0.97);
        this._panel.drawRoundedRect(panelLeft, panelTop, panelWidth, panelHeight, panelMinDimension * this._panelCornerRadiusRatio);
        this._panel.endFill();

        this._title.style.fontSize = panelWidth * this._titleFontRatio;
        this._title.position.set(width / 2, panelTop + (panelHeight * this._titleTopRatio));

        this._gameStatsLabel.style.fontSize = panelWidth * this._statsFontRatio;
        this._gameStatsLabel.position.set(width / 2, panelTop + (panelHeight * this._statsTopRatio));

        const buttonWidth = panelWidth * this._buttonWidthRatio;
        const buttonHeight = panelHeight * this._buttonHeightRatio;
        this.drawButton(buttonWidth, buttonHeight);
        this._button.position.set(width / 2, panelTop + panelHeight - (panelHeight * this._buttonBottomRatio));
    }

    private drawButton(width: number, height: number): void
    {
        this._buttonBackground.clear();
        this._buttonBackground.lineStyle(3, 0xffffff, 0.8);
        this._buttonBackground.beginFill(0xc63845, 1);
        this._buttonBackground.drawRoundedRect(
            -width / 2,
            -height / 2,
            width,
            height,
            Math.min(width, height) * this._buttonCornerRadiusRatio,
        );
        this._buttonBackground.endFill();

        this._buttonLabel.style.fontSize = Math.min(width, height) * this._buttonLabelFontRatio;
        this._buttonLabel.position.set(0, 0);
    }

    private animatePlaceholderButton(): void
    {
        if (this._isButtonAnimating)
        {
            return;
        }

        this._isButtonAnimating = true;
        this._button.scale.set(0.95);
        this._button.alpha = 0.82;

        window.setTimeout(() => {
            this._button.scale.set(1);
            this._button.alpha = 1;
            this._isButtonAnimating = false;
            this._onActionClick?.();
            console.log("VictoryScreen: placeholder action button clicked.");
        }, 130);
    }

    private formatDuration(rawDuration: number): string
    {
        const safeValue = Math.max(0, Math.floor(rawDuration));
        const digits = safeValue.toString().padStart(8, "0").slice(-8);

        const days = Number(digits.slice(0, 2));
        const hours = Number(digits.slice(2, 4));
        const minutes = Number(digits.slice(4, 6));
        const seconds = Number(digits.slice(6, 8));

        const parts: string[] = [];

        if (days > 0)
        {
            parts.push(`${days}d`);
        }
        if (hours > 0 || days > 0)
        {
            parts.push(`${hours}h`);
        }
        if (minutes > 0 || hours > 0 || days > 0)
        {
            parts.push(`${minutes}m`);
        }

        parts.push(`${seconds}s`);

        return parts.join(" ");
    }
}
