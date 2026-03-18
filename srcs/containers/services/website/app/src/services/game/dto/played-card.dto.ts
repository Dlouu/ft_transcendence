import { IsString, IsNumber, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CardDto } from "../dto/card.dto";
import { Card } from "../domain/UnoCard";

export interface IPlayedCard {
	name: string;
	cardIndex: number;
	card: CardDto;
}

export class PlayedCardDto implements IPlayedCard {
	@IsString()
	name: string;

	@IsNumber()
	cardIndex: number;

	@ValidateNested()
	@Type(() => CardDto)
	card: CardDto;
}

export const toPlayedCardDto = (
	player: string,
	playedCard: Card,
	cardIndex: number,
): PlayedCardDto => {
	const playerPlayedCardDto = new PlayedCardDto();
	playerPlayedCardDto.name = player;
	playerPlayedCardDto.cardIndex = cardIndex;

	const cardDto = new CardDto();
	cardDto.cardCode = playedCard.value;
	cardDto.cardFamily = playedCard.family;
	playerPlayedCardDto.card = cardDto;

	return playerPlayedCardDto;
};
