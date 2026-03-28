import {
	ArrayMinSize,
	IsArray,
	IsIn,
	IsNumber,
	IsString,
	Min,
	ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { Card } from "../domain/UnoCard";
import { CardDto } from "./card.dto";

export interface IInitPlayer {
	name: string;
	cardBack: string;
	profilePicture: string;
}

export class InitPlayerDto implements IInitPlayer {
	@IsString()
	name: string;

	@IsString()
	cardBack: string;

	@IsString()
	profilePicture: string;
}

export interface IInitGame {
	playerHand: CardDto[];
	players: InitPlayerDto[];
	discardTopCard: CardDto;
	firstPlayerIndex: number;
	turnDirection: "CLOCKWISE" | "COUNTER-CLOCKWISE";
	startCardNbr: number;
	playerIndex: number;
	cardTheme: "basic" | "uwu";
}

export class InitGameDto implements IInitGame {
	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => CardDto)
	playerHand: CardDto[];

	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => InitPlayerDto)
	players: InitPlayerDto[];

	@ValidateNested()
	@Type(() => CardDto)
	discardTopCard: CardDto;

	@IsNumber()
	firstPlayerIndex: number;

	@IsIn(["CLOCKWISE", "COUNTER-CLOCKWISE"])
	turnDirection: "CLOCKWISE" | "COUNTER-CLOCKWISE";

	@IsNumber()
	@Min(1)
	startCardNbr: number;

	@IsNumber()
	playerIndex: number;

	@IsIn(["basic", "uwu"])
	cardTheme: "basic" | "uwu";
}

export const toCardDtoArray = (_hand: Card[]): CardDto[] => {
	return _hand.map((card) => {
		const cardDto = new CardDto();
		cardDto.cardCode = card.value;
		cardDto.cardFamily = card.family;
		return cardDto;
	});
};
