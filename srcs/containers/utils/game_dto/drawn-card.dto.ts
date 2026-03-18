import { CardDto } from "./card.dto"; 
import { Card } from "../domain/UnoCard";

export interface IDrawnCard
{
  name: string;
  card: CardDto | undefined;
}

export class DrawnCardDto implements IDrawnCard {
  name!: string;
  card!: CardDto | undefined;
}

export const toDrewCardDto = (player: string, playedCard: Card | undefined): DrawnCardDto => {
  const playerDrewCardDto = new DrawnCardDto();
  playerDrewCardDto.name = player;
  
  if (playedCard)
  {
    const cardDto = new CardDto();
    cardDto.cardCode = playedCard.value;
    cardDto.cardFamily = playedCard.family;
    playerDrewCardDto.card = cardDto;
  }
  
  return playerDrewCardDto;
};