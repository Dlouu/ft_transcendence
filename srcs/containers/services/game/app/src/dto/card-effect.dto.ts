import { IsEnum, IsNumber, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CardCode } from "../domain/GameEnums";
import { Card } from "../domain/UnoCard";
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

export const toCardEffectDto = (
	playedCard: Card,
	effectType: CardEffectType,
	sourcePlayerIndex: number,
	affectedPlayerIndex: number,
): CardEffectDto => {
	const cardEffectDto = new CardEffectDto();

	const cardDto = new CardDto();
	cardDto.cardCode = playedCard.value;
	cardDto.cardFamily = playedCard.family;

	cardEffectDto.card = cardDto;
	cardEffectDto.effectType = effectType;
	cardEffectDto.sourcePlayerIndex = sourcePlayerIndex;
	cardEffectDto.affectedPlayerIndex = affectedPlayerIndex;

	return cardEffectDto;
};

export const resolveCardEffectType = (
	cardCode: CardCode,
): CardEffectType | null => {
	switch (cardCode) {
		case CardCode.Skip:
			return CardEffectType.Skip;
		case CardCode.DrawTwo:
		case CardCode.WildDrawFour:
			return CardEffectType.Draw;
		case CardCode.Reverse:
			return CardEffectType.Reverse;
		case CardCode.Wild:
			return CardEffectType.Wild;
		default:
			return null;
	}
};