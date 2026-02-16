import { PlayCardDto, CardDto } from './dto/play-card.dto';
import { Injectable } from "@nestjs/common";
import { CreateGameDto } from "./dto/create-game.dto";
import { game, GameState } from "./domain/game";
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
    // PLACEHOLDER: Room emit "deckReshuffled"
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
      // PLACEHOLDER: Player emit "initialHand" { hand: p._hand }
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
      // PLACEHOLDER: Room emit "gameStarted" { firstCard }
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                 Validation                                 */
  /* -------------------------------------------------------------------------- */

  shoutUno(playerName: string) {
    const game = this.findGameByPlayer(playerName);
    if (!game || game.pendingUnoPlayerIndex === null) {
      return;
    }

    const elapsed = Date.now() - game.lastActionTime;

    const SHOUTING_SECONDS = 3; // In seconds
    const ADVANTAGE_SECONDS = 0.5; // In seconds

    const UNO_WINDOW = SHOUTING_SECONDS * 1000; // In miliseconds
    const ADVANTAGE_WINDOW = ADVANTAGE_SECONDS * 1000; // In miliseconds

    if (elapsed > UNO_WINDOW) {
      return;
    }

    const pendingPlayer = game.players[game.pendingUnoPlayerIndex];
    if (!pendingPlayer) return;

    // Uno shout
    if (pendingPlayer._name === playerName) {
      if (!game.unoShouted) {
        game.unoShouted = true;
        // PLACEHOLDER: Room emit "playerShoutedUno" { player: playerName }
      }
    }
    // Counter uno shout
    else {
      if (elapsed < ADVANTAGE_WINDOW) {
        return;
      }

      if (!game.unoShouted) {
        for (let i = 0; i < 2; i++) {
          if (game.deck.length === 0) {
            this.discardToDeck(game);
          }
          const c = game.deck.pop();
          if (c) pendingPlayer._hand.push(c);
        }
        
        game.pendingUnoPlayerIndex = null;
        game.unoShouted = false;

        // PLACEHOLDER: Room emit "counterUnoSuccessful" { target: pendingPlayer._name, challenger: playerName }
      }
    }
  }

  passTurn(gameId: string, playerName: string) {
    const game = this.getGameByName(gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    if (!this.isPlayersTurn(game, playerName)) {
      throw new Error("Not your turn");
    }

    if (!game.hasDrawnThisTurn) {
      throw new Error("You must draw a card before passing");
    }

    game.hasDrawnThisTurn = false;
    this.goToNextPlayerIndex(game);
    game.lastActionTime = Date.now();

    // PLACEHOLDER: Room emit "turnPassed" { nextPlayer: ... }
    // PLACEHOLDER: Room emit "gameState"
  }

  drawCard(gameId: string, playerName: string) {
    const game = this.getGameByName(gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    if (!this.isPlayersTurn(game, playerName)) {
      throw new Error("Not your turn");
    }

    if (game.hasDrawnThisTurn) {
      throw new Error("You have already drawn a card this turn");
    }

    if (game.deck.length === 0) {
      this.discardToDeck(game);
    }

    if (game.deck.length === 0) {
      return;
    }

    const card = game.deck.pop();
    const player = game.players.find((p) => p._name === playerName);
    if (player && card) {
      player._hand.push(card);
      game.hasDrawnThisTurn = true;

      // PLACEHOLDER: Player emit "cardDrawn" { card: ... }
      // PLACEHOLDER: Room emit "opponentDrawn" { player: playerName }
      // PLACEHOLDER: Room emit "gameState"
    }
  }

  playCard(playerName: string, playCardDto: PlayCardDto) {
    const { gameId, card: cardDto, chosenFamily } = playCardDto;
    const game = this.getGameByName(gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    if (!this.isPlayersTurn(game, playerName)) {
      throw new Error("Not your turn");
    }

    const player = game.players.find((p) => p._name === playerName);
    if (!player) {
      throw new Error("Player not found");
    }

    const topCard = game.discard.length > 0 ? game.discard[game.discard.length - 1] : null;

    let isValid = false;

    if (cardDto.cardKind === CardKind.Wild || cardDto.cardKind === CardKind.WildDrawFour) {
      isValid = true;
    } else {
      if (cardDto.cardFamily === game.currentFamily) {
        isValid = true;
      } else if (topCard && topCard.kind === CardKind.Number && topCard.value === cardDto.value && cardDto.cardKind === CardKind.Number) {
        isValid = true;
      } else if (topCard && topCard.kind === cardDto.cardKind) {
        isValid = true;
      }
    }

    if (!isValid) {
      throw new Error("Invalid card played");
    }

    if (!this.doesPlayerHaveCard(cardDto, player)) {
      throw new Error("You do not possess this card");
    }

    const cardIndex = player._hand.findIndex(
      (c) => c.kind === cardDto.cardKind && c.family === cardDto.cardFamily && c.value === cardDto.value
    );
    if (cardIndex === -1) {
      throw new Error("Card not found in hand");
    }
    const playedCard = player._hand.splice(cardIndex, 1)[0];

    if (playedCard.kind === CardKind.Wild || playedCard.kind === CardKind.WildDrawFour) {
      if (!chosenFamily) {
        throw new Error("Must choose a color for Wild card");
      }
      game.currentFamily = chosenFamily;
    } else {
      game.currentFamily = playedCard.family;
    }

    game.discard.push(playedCard);

    if (playedCard.kind === CardKind.Skip) {
      this.goToNextPlayerIndex(game);
    } else if (playedCard.kind === CardKind.Reverse) {
      this.reverseTurnOrder(game);
      if (game.players.length === 2) {
        this.goToNextPlayerIndex(game);
      }
    } else if (playedCard.kind === CardKind.DrawTwo) {
      this.goToNextPlayerIndex(game);
      const victim = game.players[game.currentPlayerIndex];
      this.drawCardsToPlayer(game, victim, 2);
    } else if (playedCard.kind === CardKind.WildDrawFour) {
      this.goToNextPlayerIndex(game);
      const victim = game.players[game.currentPlayerIndex];
      this.drawCardsToPlayer(game, victim, 4);
    }

    if (player._hand.length === 0) {
      game.state = GameState.GAME_OVER;
      // PLACEHOLDER: Room emit "gameOver" { winner: playerName }
      return;
    }

    if (player._hand.length === 1) {
      game.pendingUnoPlayerIndex = game.players.findIndex((p) => p._name === playerName);
      game.unoShouted = false;
      game.lastActionTime = Date.now();
    }

    game.hasDrawnThisTurn = false;
    this.goToNextPlayerIndex(game);
    game.lastActionTime = Date.now();

    // PLACEHOLDER: Room emit "cardPlayed" { player: playerName, card: playedCard }
    // PLACEHOLDER: Room emit "gameState"
  }

  private drawCardsToPlayer(game: game, player: player, count: number) {
    for (let i = 0; i < count; i++) {
      if (game.deck.length === 0) {
        this.discardToDeck(game);
      }
      const c = game.deck.pop();
      if (c) {
        player._hand.push(c);
        // PLACEHOLDER: Player emit "cardReceived" { card: c }
      }
    }
    // PLACEHOLDER: Room emit "playerDrewCards" { player: player._name, count }
  }

  private doesPlayerHaveCard(cardDto: CardDto, player: player): boolean {
    return player._hand.some(
      (c) =>
        c.kind === cardDto.cardKind &&
        c.family === cardDto.cardFamily &&
        c.value === cardDto.value,
    );
  }

  private isPlayersTurn(game: game, playerName: string): boolean {
    const playerIndex = game.players.findIndex((p) => p._name === playerName);
    return playerIndex === game.currentPlayerIndex;
  }

  private reverseTurnOrder(game: game) {
    game.currentDirection =
      game.currentDirection === 'CLOCKWISE' ? 'COUNTER-CLOCKWISE' : 'CLOCKWISE';
    // PLACEHOLDER: Room emit "directionChanged" { direction: game.currentDirection }
  }

  private goToNextPlayerIndex(game: game) {
    if (game.currentDirection === 'CLOCKWISE') {
      game.currentPlayerIndex =
        (game.currentPlayerIndex + 1) % game.players.length;
    } else {
      game.currentPlayerIndex =
        (game.currentPlayerIndex - 1 + game.players.length) %
        game.players.length;
    }
    // PLACEHOLDER: Room emit "turnChanged" { currentPlayerIndex: game.currentPlayerIndex }
  }
}
