import { Card } from "../domain/UnoCard";
import { CardDto } from "./play-card.dto";
export interface IInitHand {
    hand: CardDto[];
}
export declare class InitHandDto implements IInitHand {
    hand: CardDto[];
}
export declare const toInitHandDto: (_hand: Card[]) => InitHandDto;
