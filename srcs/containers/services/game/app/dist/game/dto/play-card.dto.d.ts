import { CardFamily, CardKind } from "../domain/card";
export declare class CardDto {
    cardKind: CardKind;
    cardFamily: CardFamily;
    value?: number;
}
export declare class PlayCardDto {
    gameId: string;
    card: CardDto;
    chosenFamily?: CardFamily;
}
