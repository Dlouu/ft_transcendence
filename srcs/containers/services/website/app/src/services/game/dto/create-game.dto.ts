import {
	IsString,
	IsArray,
	IsNumber,
	IsIn,
	ArrayMinSize,
	Min,
	Max,
} from "class-validator";

export interface ICreateGame {
	roomName: string;
	players: string[]; // To replace by uids
	botNbr: number;
	theme: "BASE" | "UWU";
}

export class CreateGameDto implements ICreateGame {
	@IsString()
	roomName: string;

	@IsArray()
	@IsString({ each: true })
	@ArrayMinSize(1)
	players: string[];

	@IsNumber()
	@Min(0)
	@Max(3)
	botNbr: number;

	@IsIn(["BASE", "UWU"])
	theme: "BASE" | "UWU";
}
