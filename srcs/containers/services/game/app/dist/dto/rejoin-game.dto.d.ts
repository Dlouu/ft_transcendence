import { Game } from "../domain/UnoGame";
import { UnoPlayer } from "../domain/UnoPlayer";
import { CardDto } from "./card.dto";
export interface IRejoinOpponentHandSize {
    index: number;
    name: string;
    handSize: number;
}
export declare class RejoinOpponentHandSizeDto implements IRejoinOpponentHandSize {
    index: number;
    name: string;
    handSize: number;
}
export interface IRejoinGame {
    playerIndex: number;
    playerHand: CardDto[];
    opponents: RejoinOpponentHandSizeDto[];
    currentPlayerIndex: number;
    turnDirection: "CLOCKWISE" | "COUNTER-CLOCKWISE";
    currentDiscardCard: CardDto;
}
export declare class RejoinGameDto implements IRejoinGame {
    playerIndex: number;
    playerHand: CardDto[];
    opponents: RejoinOpponentHandSizeDto[];
    currentPlayerIndex: number;
    turnDirection: "CLOCKWISE" | "COUNTER-CLOCKWISE";
    currentDiscardCard: CardDto;
}
export declare const toRejoinGameDto: (player: UnoPlayer, game: Game) => RejoinGameDto | null;
