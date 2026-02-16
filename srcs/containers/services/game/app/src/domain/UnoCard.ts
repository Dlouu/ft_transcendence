export enum CardFamily {
  ONE = "set-one",
  TWO = "set-two",
  THREE = "set-three",
  FOUR = "set-four",
  WILD = "wild",
}

export enum CardCode {
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
  WildDrawFour = "wildDrawFour",
}

export const isNumberCard = (code: CardCode): boolean =>
  code === CardCode.Zero ||
  code === CardCode.One ||
  code === CardCode.Two ||
  code === CardCode.Three ||
  code === CardCode.Four ||
  code === CardCode.Five ||
  code === CardCode.Six ||
  code === CardCode.Seven ||
  code === CardCode.Eight ||
  code === CardCode.Nine;

export class Card {
  constructor() {}
  value: CardCode;
  family: CardFamily;
}
