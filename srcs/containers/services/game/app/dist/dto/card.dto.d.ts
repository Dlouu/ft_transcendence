import { CardFamily, CardCode } from "../domain/GameEnums";
export interface ICard {
    cardCode: CardCode;
    cardFamily: CardFamily;
}
export declare class CardDto implements ICard {
    cardCode: CardCode;
    cardFamily: CardFamily;
}
