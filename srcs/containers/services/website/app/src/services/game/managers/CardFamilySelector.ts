import { Container, Graphics } from "pixi.js";
import { CardFamily } from "../domain/GameEnums";

export type SelectableCardFamily = Exclude<CardFamily, CardFamily.WILD>;

export type CardFamilySelectorColors = Record<SelectableCardFamily, string>;

export class CardFamilySelector extends Container
{
    private static readonly FAMILIES: SelectableCardFamily[] = [
        CardFamily.ONE,
        CardFamily.TWO,
        CardFamily.THREE,
        CardFamily.FOUR,
    ];
    private static readonly BORDER_COLOR: number = 0x2f2f2f;
    private static readonly BORDER_ALPHA: number = 0.95;
    private static readonly BORDER_WIDTH: number = 4;
    private static readonly PIXEL_SIZE: number = 3;

    private _radius: number;
    private _onSelect?: (cardFamily: SelectableCardFamily) => void;

    constructor(
        colors: CardFamilySelectorColors,
        radius: number = 90,
        onSelect?: (cardFamily: SelectableCardFamily) => void,
    )
    {
        super();

        this._radius = radius;
        this._onSelect = onSelect;

        this.drawSectors(colors);
    }

    private drawSectors(colors: CardFamilySelectorColors): void
    {
        const sectorAngle = (Math.PI * 2) / CardFamilySelector.FAMILIES.length;
        const startOffset = -Math.PI / 2;

        CardFamilySelector.FAMILIES.forEach((family, index) => {
            const sector = new Graphics();
            const startAngle = startOffset + (index * sectorAngle);
            const endAngle = startAngle + sectorAngle;
            const fillColor = this.parseHexColor(colors[family]);

            sector.lineStyle(
                CardFamilySelector.BORDER_WIDTH,
                CardFamilySelector.BORDER_COLOR,
                CardFamilySelector.BORDER_ALPHA
            );
            sector.beginFill(fillColor, 1);
            sector.moveTo(0, 0);
            const arcPoints = this.buildPixelArcPoints(startAngle, endAngle, this._radius);
            const [startPoint, ...remainingPoints] = arcPoints;

            sector.lineTo(startPoint.x, startPoint.y);
            remainingPoints.forEach((point) => {
                sector.lineTo(point.x, point.y);
            });
            sector.lineTo(0, 0);
            sector.endFill();

            sector.eventMode = "static";
            sector.cursor = "pointer";
            sector.on("pointertap", () => {
                this.visible = false;
                this._onSelect?.(family);
            });

            this.addChild(sector);
        });
    }

    private buildPixelArcPoints(startAngle: number, endAngle: number, radius: number): { x: number; y: number }[]
    {
        const arcLength = Math.abs(endAngle - startAngle) * radius;
        const steps = Math.max(6, Math.ceil(arcLength / CardFamilySelector.PIXEL_SIZE));
        const points: { x: number; y: number }[] = [];

        for (let i = 0; i <= steps; i++)
        {
            const t = i / steps;
            const angle = startAngle + ((endAngle - startAngle) * t);
            const x = this.snapToPixelGrid(Math.cos(angle) * radius);
            const y = this.snapToPixelGrid(Math.sin(angle) * radius);
            const previousPoint = points[points.length - 1];

            if (!previousPoint || previousPoint.x !== x || previousPoint.y !== y)
            {
                points.push({ x, y });
            }
        }

        return points;
    }

    private snapToPixelGrid(value: number): number
    {
        return Math.round(value / CardFamilySelector.PIXEL_SIZE) * CardFamilySelector.PIXEL_SIZE;
    }

    private parseHexColor(color: string): number
    {
        if (color.startsWith("#"))
        {
            return parseInt(color.slice(1), 16);
        }

        if (color.startsWith("0x"))
        {
            return parseInt(color.slice(2), 16);
        }

        return parseInt(color, 16);
    }
}