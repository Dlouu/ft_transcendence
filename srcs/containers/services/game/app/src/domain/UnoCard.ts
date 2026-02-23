import { CardCode, CardFamily } from "./GameEnums";

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
