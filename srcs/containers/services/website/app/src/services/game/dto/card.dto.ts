import { IsEnum } from "class-validator";
import { CardFamily, CardCode } from "../domain/GameEnums";

export interface ICard {
	cardCode: CardCode;
	cardFamily: CardFamily;
}

export class CardDto implements ICard {
	@IsEnum(CardCode)
	cardCode: CardCode;

	@IsEnum(CardFamily)
	cardFamily: CardFamily;
}
