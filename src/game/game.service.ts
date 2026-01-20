import { PlayCardDto, CardDto } from './dto/play-card.dto';
import { Injectable } from "@nestjs/common";
import { CreateGameDto } from "./dto/create-game.dto";
import { game } from "./domain/game";
import { player } from "./domain/player";
import { card, CardFamily, CardKind } from "./domain/card";

@Injectable()
export class GameService {
  private games: game[] = [];

  join(playerName: string): game | null {
    const game = this.findGameByPlayer(playerName);
    if (!game) {
      return null;
    }

    game.connectedPlayers.add(playerName);

    return game;
  }

  leave(playerName: string): game | null {
    const game = this.findGameByPlayer(playerName);
    if (game) {
      game.connectedPlayers.delete(playerName);
      return game;
    }
    return null;
  }

  private findGameByPlayer(playerName: string): game | undefined {
    return this.games.find((g) =>
      g.players.some((p) => p._name === playerName),
    );
  }

  create(createGameDto: CreateGameDto): game {
    const { roomName, players, botNbr } = createGameDto;

    const newGame = new game(roomName, players, players.length, botNbr);

    newGame.deck = this.shuffleDeck(this.createDeck());
    this.startDeal(newGame);

    this.games.push(newGame);

    console.log("Game " + newGame.roomName + " has been created !");

    return newGame;
  }

  getGameByName(name: string): game | undefined {
    return this.games.find((g) => g.roomName === name);
  }

  randomizePlayerOrder(game: game): void {
    for (let i = game.players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [game.players[i], game.players[j]] = [game.players[j], game.players[i]];
    }
  }

  createDeck(): card[] {
    const deck: card[] = [];

    const pushCard = (kind: CardKind, family: CardFamily, value?: number) => {
      const c = new card();
      c.kind = kind;
      c.family = family;
      if (value !== undefined) c.value = value;
      deck.push(c);
    };

    const colors: CardFamily[] = [
      CardFamily.ONE,
      CardFamily.TWO,
      CardFamily.THREE,
      CardFamily.FOUR,
    ];

    for (const color of colors) {
      pushCard(CardKind.Number, color, 0);
      for (let value = 1; value <= 9; value++) {
        pushCard(CardKind.Number, color, value);
        pushCard(CardKind.Number, color, value);
      }

      for (let i = 0; i < 2; i++) {
        pushCard(CardKind.Skip, color);
        pushCard(CardKind.Reverse, color);
        pushCard(CardKind.DrawTwo, color);
      }
    }

    for (let i = 0; i < 4; i++) {
      pushCard(CardKind.Wild, CardFamily.WILD);
      pushCard(CardKind.WildDrawFour, CardFamily.WILD);
    }

    return deck;
  }

  shuffleDeck(deck: card[]): card[] {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  discardToDeck(game: game): void {
    if (game.discard.length <= 1) return;

    const topCard = game.discard.pop();

    game.deck = this.shuffleDeck([...game.deck, ...game.discard]);

    game.discard = [];
    if (topCard) {
      game.discard.push(topCard);
    }
  }

  printDeck(game: game): void {
    console.log("Deck:");
    game.deck.forEach((c, i) => {
      console.log(`${i}: ${c.family} ${c.kind} ${c.value ?? ""}`);
    });
  }

  printHands(game: game): void {
    console.log("Players' Hands:");
    for (const p of game.players) {
      console.log(`${p._name}:`);
      p._hand.forEach((c, i) => {
        console.log(`  ${i}: ${c.family} ${c.kind} ${c.value ?? ""}`);
      });
    }
  }

  startDeal(game: game): void {
    const cardsPerPlayer = 7;

    for (const p of game.players) {
      for (let i = 0; i < cardsPerPlayer; i++) {
        const drawnCard = game.deck.pop();
        if (drawnCard) {
          p._hand.push(drawnCard);
        }
      }
    }

    let firstCard = game.deck.pop();
    while (firstCard && firstCard.kind !== CardKind.Number) {
      game.deck.unshift(firstCard);
      game.deck = this.shuffleDeck(game.deck);
      firstCard = game.deck.pop();
    }

    if (firstCard) {
      game.discard.push(firstCard);
      game.currentFamily = firstCard.family;
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                 Validation                                 */
  /* -------------------------------------------------------------------------- */

  shoutUno() { // Card count <= 2? Timer valid?

  }

  passTurn() { // Did they just draw? Is passing allowed?

  }

  drawCard() { // Turn?, Deck empty? (handle reshuffle)

  }

  playCard(playCardDto: PlayCardDto) { // Turn?, In Hand?, Matches Pile?, Valid Color?

  }

  private validatePlayCard() {

  }

  private doesPlayerHaveCard(cardDto: CardDto, player: player): boolean {
    return player._hand.some(
      (c) =>
        c.kind === cardDto.cardKind &&
        c.family === cardDto.cardFamily &&
        c.value === cardDto.value,
    );
  }
}
