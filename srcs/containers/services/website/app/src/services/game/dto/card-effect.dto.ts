import { IsEnum, IsNumber, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CardDto } from "./card.dto";

export enum CardEffectType {
	Skip = "skip",
	Draw = "draw",
	Reverse = "reverse",
	Wild = "wild",
}

export interface ICardEffectDto {
	card: CardDto;
	effectType: CardEffectType;
	sourcePlayerIndex: number;
	affectedPlayerIndex: number;
}

export class CardEffectDto implements ICardEffectDto {
	@ValidateNested()
	@Type(() => CardDto)
	card: CardDto;

	@IsEnum(CardEffectType)
	effectType: CardEffectType;

	@IsNumber()
	@Min(0)
	sourcePlayerIndex: number;

	@IsNumber()
	@Min(0)
	affectedPlayerIndex: number;
}