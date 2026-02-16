export declare enum CardFamily {
    ONE = "set-one",
    TWO = "set-two",
    THREE = "set-three",
    FOUR = "set-four",
    WILD = "wild"
}
export declare enum CardCode {
    Zero = "zero",
    One = "one",
    Two = "two",
    Three = "three",
    Four = "four",
    Five = "five",
    Six = "six",
    Seven = "seven",
    Eight = "eight",
    Nine = "nine",
    Skip = "skip",
    Reverse = "reverse",
    DrawTwo = "drawTwo",
    Wild = "wild",
    WildDrawFour = "wildDrawFour"
}
export declare const isNumberCard: (code: CardCode) => boolean;
export declare class Card {
    constructor();
    value: CardCode;
    family: CardFamily;
}
