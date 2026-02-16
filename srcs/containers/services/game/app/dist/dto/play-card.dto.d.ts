import { CardFamily, CardCode } from "../domain/UnoCard";
export interface ICard {
    cardCode: CardCode;
    cardFamily: CardFamily;
}
export declare class CardDto implements ICard {
    cardCode: CardCode;
    cardFamily: CardFamily;
}
