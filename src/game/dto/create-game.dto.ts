import {
  IsString,
  IsArray,
  IsNumber,
  IsIn,
  ArrayMinSize,
  Min,
  Max,
} from "class-validator";

export class CreateGameDto {
  @IsString()
  roomName: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  players: string[]; // To replace by uids

  @IsNumber()
  @Min(0)
  @Max(3)
  botNbr: number;

  @IsIn(["BASE", "UWU"])
  theme: "BASE" | "UWU";
}
