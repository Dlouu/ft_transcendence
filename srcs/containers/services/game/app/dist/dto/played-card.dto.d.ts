import { CardDto } from "../dto/card.dto";
import { Card } from "../domain/UnoCard";
export interface IPlayedCard {
    name: string;
    cardIndex: number;
    card: CardDto;
}
export declare class PlayedCardDto implements IPlayedCard {
    name: string;
    cardIndex: number;
    card: CardDto;
}
export declare const toPlayedCardDto: (player: string, playedCard: Card, cardIndex: number) => PlayedCardDto;
