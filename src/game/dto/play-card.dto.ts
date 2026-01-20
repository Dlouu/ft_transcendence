import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { CardFamily, CardKind } from "../domain/card";

export class CardDto {
  @IsEnum(CardKind)
  cardKind: CardKind;

  @IsEnum(CardFamily)
  cardFamily: CardFamily;

  @IsOptional()
  @IsNumber()
  value?: number;
}

export class PlayCardDto {
  @IsString()
  gameId: string;

  @ValidateNested()
  @Type(() => CardDto)
  card: CardDto;

  // @IsOptional()
  // @IsString()
  // chosenFamily?: string;
}
