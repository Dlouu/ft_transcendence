import {
  IsString,
  IsNumber,
} from "class-validator";
import { UnoPlayer } from "../domain/UnoPlayer";

export interface IPlayedCard
{
  name: string;
  cardIndex: number;
}

export class PlayedCardDto implements IPlayedCard {
  @IsString()
  name: string;

  @IsNumber()
  cardIndex: number;
}

export const toPlayedCardDto = (player: UnoPlayer, cardIndex: number): PlayedCardDto => {
  const playerPlayedCardDto = new PlayedCardDto();
  playerPlayedCardDto.name = player._name;
  playerPlayedCardDto.cardIndex = cardIndex;
  return playerPlayedCardDto;
};