import {
  IsString,
  IsOptional,
  IsEnum,
  ValidateNested,
} from "class-validator";
import { CardFamily, CardCode } from "../domain/UnoCard";

export interface ICard
{
  cardCode: CardCode;
  cardFamily: CardFamily;
}

export class CardDto implements ICard {
  @IsEnum(CardCode)
  cardCode: CardCode;

  @IsEnum(CardFamily)
  cardFamily: CardFamily;
}
