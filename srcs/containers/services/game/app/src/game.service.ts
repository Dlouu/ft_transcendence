import { CardDto } from './dto/play-card.dto';
import { toInitHandDto } from './dto/init-hand.dto';
import { ConflictException, Injectable } from "@nestjs/common";
import { CreateGameDto } from "./dto/create-game.dto";
import { Game, GameState } from "./domain/UnoGame";
import { UnoPlayer } from "./domain/UnoPlayer";
import { Card, CardFamily, CardCode, isNumberCard } from "./domain/UnoCard";
import { Server, Socket } from 'socket.io';

@Injectable()
export class GameService {
  private io?: Server;
  private games: Game[] = [];

  setServer(io: Server): void {
    this.io = io;
  }

  join(playerId: string, game: Game, socket: Socket): void {
    if (!game) {
      return;
    }

    const player = game.players.find((p) => p._name === playerId);
    if (player) {
      player._socket = socket;
    }

    game.connectedPlayers.add(playerId);

    if (game.state == GameState.PLAYING || game.state == GameState.AWAITING_COLOR_CHOICE)
      this.rejoin(this.findPlayerInGame(game, playerId));
  }

  rejoin(player: UnoPlayer | null): void
  {
    if (!player)
      return;
    
    // TODO: Send everything need by the reconnecting player.
    // Current hand, opponents hand sizes, currentPlayerIndex,
    // currentDirection, currentDiscardCard
  }

  findPlayerInGame(game: Game, playerId: string): UnoPlayer | null
  {
    if (!game) {
      return null;
    }

    const player = game.players.find((p) => p._name === playerId);
    if (!player) {
      return null;
    }

    return player;
  }

  tryStart(game: Game): void
  {
    if (this.io && game.connectedPlayers.size === game.players.length)
    {
      this.startGame(game);
      console.log(`Game '${game.roomName}' started !`);
    }
  }

  leave(playerName: string): Game | null {
    const game = this.findGameByPlayer(playerName);
    return game ?? null;
  }

  deleteGame(game: Game): void {
    this.games = this.games.filter((existingGame) => existingGame !== game);
  }

  startGame(game: Game): void
  {
    if (!game || game.state === GameState.PLAYING) {
      return;
    }

    this.randomizePlayerOrder(game);

    game.currentPlayerIndex = 0;
    game.currentDirection = "CLOCKWISE";

    if (!game.currentFamily && game.discard.length > 0) {
      const topCard = game.discard[game.discard.length - 1];
      game.currentFamily = topCard.family;
    }

    game.pendingUnoPlayerIndex = null;
    game.unoShouted = false;
    game.hasDrawnThisTurn = false;

    const now = Date.now();
    game.turnStartTime = now;
    game.lastActionTime = now;

    game.deck = this.shuffleDeck(this.createDeck());

    this.startDeal(game);

    game.state = GameState.PLAYING;
  }

  findGameByPlayer(playerName: string): Game | undefined {
    return this.games.find((g) =>
      g.players.some((p) => p._name === playerName),
    );
  }

  create(createGameDto: CreateGameDto): Game {
    const { roomName, players, botNbr } = createGameDto;

    if (this.getGameByName(roomName)) {
      throw new ConflictException("Game name already exists");
    }

    const newGame = new Game(roomName, players, players.length, botNbr);

    newGame.state = GameState.WAITING_FOR_PLAYERS;

    this.games.push(newGame);

    console.log("Game " + newGame.roomName + " has been created !");

    return newGame;
  }

  getGameByName(name: string): Game | undefined {
    return this.games.find((g) => g.roomName === name);
  }

  randomizePlayerOrder(game: Game): void {
    for (let i = game.players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [game.players[i], game.players[j]] = [game.players[j], game.players[i]];
    }
  }

  createDeck(): Card[] {
    const deck: Card[] = [];

    const pushCard = (code: CardCode, family: CardFamily) => {
      const c = new Card();
      c.value = code;
      c.family = family;
      deck.push(c);
    };

    const colors: CardFamily[] = [
      CardFamily.ONE,
      CardFamily.TWO,
      CardFamily.THREE,
      CardFamily.FOUR,
    ];

    const numberCards: CardCode[] = [
      CardCode.One,
      CardCode.Two,
      CardCode.Three,
      CardCode.Four,
      CardCode.Five,
      CardCode.Six,
      CardCode.Seven,
      CardCode.Eight,
      CardCode.Nine,
    ];

    for (const color of colors) {
      pushCard(CardCode.Zero, color);
      for (const numberCard of numberCards) {
        pushCard(numberCard, color);
        pushCard(numberCard, color);
      }

      for (let i = 0; i < 2; i++) {
        pushCard(CardCode.Skip, color);
        pushCard(CardCode.Reverse, color);
        pushCard(CardCode.DrawTwo, color);
      }
    }

    for (let i = 0; i < 4; i++) {
      pushCard(CardCode.Wild, CardFamily.WILD);
      pushCard(CardCode.WildDrawFour, CardFamily.WILD);
    }

    return deck;
  }

  shuffleDeck(deck: Card[]): Card[] {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  discardToDeck(game: Game): void {
    if (game.discard.length <= 1) return;

    const topCard = game.discard.pop();

    game.deck = this.shuffleDeck([...game.deck, ...game.discard]);

    game.discard = [];
    if (topCard) {
      game.discard.push(topCard);
    }
    this.io?.to(game.roomName).emit("game:discardToDeck"); // TODO: Change the payload to a dto
  }

  printDeck(game: Game): void {
    console.log("Deck:");
    game.deck.forEach((c, i) => {
      console.log(`${i}: ${c.family} ${c.value}`);
    });
  }

  printHands(game: Game): void {
    console.log("Players' Hands:");
    for (const p of game.players) {
      console.log(`${p._name}:`);
      p._hand.forEach((c, i) => {
        console.log(`  ${i}: ${c.family} ${c.value}`);
      });
    }
  }

  startDeal(game: Game): void {
    const cardsPerPlayer = 7;

    game.state = GameState.DEALING;

    for (const p of game.players) {
      for (let i = 0; i < cardsPerPlayer; i++) {
        const drawnCard = game.deck.pop();
        if (drawnCard) {
          p._hand.push(drawnCard);
        }
      }
      if (p._socket)
        p._socket.emit("game:initHand", toInitHandDto(p._hand));
    }

    let firstCard = game.deck.pop();
    while (firstCard && !isNumberCard(firstCard.value)) {
      game.deck.unshift(firstCard);
      game.deck = this.shuffleDeck(game.deck);
      firstCard = game.deck.pop();
    }

    if (firstCard) {
      game.discard.push(firstCard);
      game.currentFamily = firstCard.family;
      this.io?.to(game.roomName).emit("game:start", { firstCard: firstCard })
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

  playCard(playerName: string, )
  {
    // TODO: Redo this ENTIRE function, you dumbfuck asshole !
  }

  private doesPlayerHaveCard(cardDto: CardDto, player: UnoPlayer): boolean {
    return player._hand.some(
      (c) =>
        c.value === cardDto.cardCode && c.family === cardDto.cardFamily,
    );
  }

  private isPlayersTurn(game: Game, playerName: string): boolean {
    const playerIndex = game.players.findIndex((p) => p._name === playerName);
    return playerIndex === game.currentPlayerIndex;
  }

  private reverseTurnOrder(game: Game) {
    game.currentDirection =
      game.currentDirection === 'CLOCKWISE' ? 'COUNTER-CLOCKWISE' : 'CLOCKWISE';
    this.io?.to(game.roomName).emit("game:directionChanged", game.currentDirection); // TODO: Change the payload to a dto
  }

  private goToNextPlayerIndex(game: Game) {
    if (game.currentDirection === 'CLOCKWISE') {
      game.currentPlayerIndex =
        (game.currentPlayerIndex + 1) % game.players.length;
    } else {
      game.currentPlayerIndex =
        (game.currentPlayerIndex - 1 + game.players.length) %
        game.players.length;
    }
    this.io?.to(game.roomName).emit("game:currentPlayerChanged", game.currentPlayerIndex); // TODO: Change the payload to a dto
  }
}
