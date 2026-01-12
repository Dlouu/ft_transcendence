export class PlayCardDto {
  gameId: string;
  cardId: string; // Or specific composite { color: 'RED', value: '5' }
  chosenColor?: string; // Required if the card is a Wild
}
