import { CardDto } from "./card.dto";
import { Card } from "../domain/UnoCard";
export interface IDrawnCard {
    name: string;
    card: CardDto | undefined;
}
export declare class DrawnCardDto implements IDrawnCard {
    name: string;
    card: CardDto | undefined;
}
export declare const toDrewCardDto: (player: string, playedCard: Card | undefined) => DrawnCardDto;
