import { CardCode, CardFamily } from "./GameEnums";
export declare const isNumberCard: (code: CardCode) => boolean;
export declare class Card {
    constructor();
    value: CardCode;
    family: CardFamily;
}
