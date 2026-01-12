export enum CardColor {
  RED,
  BLUE,
  GREEN,
  YELLOW,
  BLACK,
}

export enum CardKind {
  Number,
  Skip,
  Reverse,
  DrawTwo,
  Wild,
  WildDrawFour,
}

export class card {
  constructor() {}
  kind: CardKind;
  color: CardColor;
  value?: number;
}
