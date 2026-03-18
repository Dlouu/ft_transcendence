import {
  IsString,
  IsArray,
  IsNumber,
  IsIn,
  ArrayMinSize,
  Min,
  Max,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export interface ICreateGamePlayer {
  id: string;
  name: string;
  cardBackUrl: string;
}

export class CreateGamePlayerDto implements ICreateGamePlayer {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  cardBackUrl: string;
}

export interface ICreateGame
{
  roomName: string;
  players: CreateGamePlayerDto[];
  botNbr: number;
  theme: "BASE" | "UWU";
}

export class CreateGameDto implements ICreateGame {
  @IsString()
  roomName: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateGamePlayerDto)
  players: CreateGamePlayerDto[];

  @IsNumber()
  @Min(0)
  @Max(3)
  botNbr: number;

  @IsIn(["BASE", "UWU"])
  theme: "BASE" | "UWU";
}
