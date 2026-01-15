import { Injectable } from "@nestjs/common";
import { CreateGameDto } from "./dto/create-game.dto";
import { game } from "./domain/game";
import { card, CardColor, CardKind } from "./domain/card";
import { player } from "./domain/player";

@Injectable()
export class GameService {
  private games: game[] = [];

  join(createGameDto: CreateGameDto) {
    const { roomName, players } = createGameDto;

    let existingGame = this.getGameByName(roomName);

    if (!existingGame) {
      this.create(createGameDto);
      existingGame = this.getGameByName(roomName);
    } else {
      for (const playerInfo of players) {
        const alreadyJoined = existingGame.players.some(
          (p) => p._name === playerInfo.name
        );
        if (!alreadyJoined) {
          existingGame.players.push(
            new player(playerInfo.name, playerInfo.isAi)
          );
        }
      }
    }

    return existingGame;
  }

  create(createGameDto: CreateGameDto) {
    const { roomName, players } = createGameDto;
    let playerNbr: number = 0;

    for (let i = 0; i < players.length; i++) {
      if (players.at(i)?.isAi === true) playerNbr++;
    }

    const newGame = new game(roomName, players, playerNbr);

    newGame.deck = this.shuffleDeck(this.createDeck());

    this.games.push(newGame);
    return newGame;
  }

  getGameByName(name: string) {
    return this.games.find((g) => g.roomName === name);
  }

  createDeck(): card[] {
    const deck: card[] = [];

    const pushCard = (kind: CardKind, color: CardColor, value?: number) => {
      const c = new card();
      c.kind = kind;
      c.color = color;
      if (value !== undefined) c.value = value;
      deck.push(c);
    };

    const colors: CardColor[] = [
      CardColor.RED,
      CardColor.BLUE,
      CardColor.GREEN,
      CardColor.YELLOW,
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
      pushCard(CardKind.Wild, CardColor.BLACK);
      pushCard(CardKind.WildDrawFour, CardColor.BLACK);
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

  discardToDeck(game: game) {
    if (game.discard.length <= 1) return;

    const topCard = game.discard.pop();
    
    game.deck = this.shuffleDeck([...game.deck, ...game.discard]);
    
    game.discard = [];
    if (topCard) {
      game.discard.push(topCard);
    }
  }

  printDeck(game: game) {
    console.log("Deck:");
    game.deck.forEach((c, i) => {
      console.log(`${i}: ${c.color} ${c.kind} ${c.value ?? ""}`);
    });
  }

  printHands(game: game) {
    console.log("Players' Hands:");
    for (const p of game.players) {
      console.log(`${p._name}:`);
      p._hand.forEach((c, i) => {
        console.log(`  ${i}: ${c.color} ${c.kind} ${c.value ?? ""}`);
      });
    }
  }

  startDeal(game: game) {
    const cardsPerPlayer = 7;

    for (const p of game.players) {
      for (let i = 0; i < cardsPerPlayer; i++) {
        const drawnCard = game.deck.pop();
        if (drawnCard) {
          p._hand.push(drawnCard);
        }
      }
    }

    // Place first card on discard pile (skip action cards)
    let firstCard = game.deck.pop();
    while (firstCard && firstCard.kind !== CardKind.Number) {
      game.deck.unshift(firstCard);
      game.deck = this.shuffleDeck(game.deck);
      firstCard = game.deck.pop();
    }

    if (firstCard) {
      game.discard.push(firstCard);
      game.currentColor = firstCard.color;
    }
  }
}
