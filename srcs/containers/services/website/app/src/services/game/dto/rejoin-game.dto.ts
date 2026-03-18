import { Type } from "class-transformer";
import {
	ArrayMinSize,
	IsArray,
	IsIn,
	IsNumber,
	IsString,
	Min,
	ValidateNested,
} from "class-validator";
import { CardDto } from "./card.dto";

export interface IRejoinOpponentHandSize {
	index: number;
	name: string;
	handSize: number;
}

export class RejoinOpponentHandSizeDto implements IRejoinOpponentHandSize {
	@IsNumber()
	@Min(0)
	index: number;

	@IsString()
	name: string;

	@IsNumber()
	@Min(0)
	handSize: number;
}

export interface IRejoinGame {
	playerIndex: number;
	playerHand: CardDto[];
	opponents: RejoinOpponentHandSizeDto[];
	currentPlayerIndex: number;
	turnDirection: "CLOCKWISE" | "COUNTER-CLOCKWISE";
	currentDiscardCard: CardDto;
}

export class RejoinGameDto implements IRejoinGame {
	@IsNumber()
	@Min(0)
	playerIndex: number;

	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => CardDto)
	playerHand: CardDto[];

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => RejoinOpponentHandSizeDto)
	opponents: RejoinOpponentHandSizeDto[];

	@IsNumber()
	@Min(0)
	currentPlayerIndex: number;

	@IsIn(["CLOCKWISE", "COUNTER-CLOCKWISE"])
	turnDirection: "CLOCKWISE" | "COUNTER-CLOCKWISE";

	@ValidateNested()
	@Type(() => CardDto)
	currentDiscardCard: CardDto;
}