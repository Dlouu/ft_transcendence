export enum CardFamily {
  ONE = "ONE",
  TWO = "TWO",
  THREE = "THREE",
  FOUR = "FOUR",
  WILD = "WILD",
}

export enum CardKind {
  Number = "Number",
  Skip = "Skip",
  Reverse = "Reverse",
  DrawTwo = "DrawTwo",
  Wild = "Wild",
  WildDrawFour = "WildDrawFour",
}

export class card {
  constructor() {}
  kind: CardKind;
  family: CardFamily;
  value?: number;
}
