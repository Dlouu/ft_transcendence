import { Card } from "../domain/UnoCard";
import { CardDto } from "./card.dto";
export declare class InitPlayerDto {
    name: string;
    cardBack: string;
}
export interface IInitHand {
    playerHand: CardDto[];
    players: InitPlayerDto[];
    discardTopCard: CardDto;
    firstPlayerIndex: number;
    turnDirection: "CLOCKWISE" | "COUNTER-CLOCKWISE";
    startCardNbr: number;
    playerIndex: number;
    cardTheme: "basic" | "uwu";
}
export declare class InitGameDto implements IInitHand {
    playerHand: CardDto[];
    players: InitPlayerDto[];
    discardTopCard: CardDto;
    firstPlayerIndex: number;
    turnDirection: "CLOCKWISE" | "COUNTER-CLOCKWISE";
    startCardNbr: number;
    playerIndex: number;
    cardTheme: "basic" | "uwu";
}
export declare const toCardDtoArray: (_hand: Card[]) => CardDto[];
