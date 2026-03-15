import { Type } from "class-transformer";
import {
	IsArray,
	IsBoolean,
	IsNumber,
	IsString,
	ValidateNested,
} from "class-validator";

export interface IGameWinPlayer {
	name: string;
	id: string;
	isBot: boolean;
	cardsLeft: number;
}

export class GameWinPlayerDto implements IGameWinPlayer {
	@IsString()
	name: string;

	@IsString()
	id: string;

	@IsBoolean()
	isBot: boolean;

	@IsNumber()
	cardsLeft: number;
}

export interface IGameWin {
	winner: string;
	players: GameWinPlayerDto[];
	gameDuration: number; // Format : ddhhmmss
	turnNbr: number;
}

export class GameWinDto implements IGameWin {
	@IsString()
	winner: string;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => GameWinPlayerDto)
	players: GameWinPlayerDto[];

	@IsNumber()
	gameDuration: number;

	@IsNumber()
	turnNbr: number;
}
