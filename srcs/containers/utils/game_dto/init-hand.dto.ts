import { ArrayMinSize, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { Card } from "../domain/UnoCard";
import { CardDto } from "./play-card.dto";

export interface IInitHand
{
  hand: CardDto[];
}

export class InitHandDto implements IInitHand {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CardDto)
  hand: CardDto[];
}

export const toInitHandDto = (_hand: Card[]): InitHandDto => {
  const dto = new InitHandDto();
  dto.hand = _hand.map((card) => {
    const cardDto = new CardDto();
    cardDto.cardCode = card.value;
    cardDto.cardFamily = card.family;
    return cardDto;
  });
  return dto;
};
