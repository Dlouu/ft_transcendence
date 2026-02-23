import { generateNickname, UnoPlayer } from "./UnoPlayer";
import { CardFamily, GameState } from "./GameEnums";
import { DeckPile } from "./DeckPile";

export class Game {
  public roomName: string;
  public cardTheme: "basic" | "uwu";

  public players: UnoPlayer[];
  public connectedPlayers: Set<string>;
  public expectedPlayers: string[];
  private realPlayersNbr: number;
  private botNbr: number;

  public deck: DeckPile;
  public discard: DeckPile;
  public currentFamily: CardFamily;
  public currentDirection: "CLOCKWISE" | "COUNTER-CLOCKWISE";
  public currentPlayerIndex: number;

  public createdAt: number; // Timestamp of room creation
  public turnStartTime: number; // Timestamp
  public lastActionTime: number;
  public pendingUnoPlayerIndex: number | null;

  public state: GameState;

  constructor(
    name: string,
    players: string[], // To replace by uids
    playerNbr: number,
    botNbr: number,
    cardTheme: "basic" | "uwu",
  ) {
    this.roomName = name;
    this.cardTheme = cardTheme;
    this.expectedPlayers = players;
    this.realPlayersNbr = playerNbr;
    this.botNbr = botNbr;

    this.players = [];
    this.deck = new DeckPile();

    this.currentPlayerIndex = 0;
    this.currentDirection = "CLOCKWISE";

    this.discard = new DeckPile();

    this.createdAt = Date.now();

    this.connectedPlayers = new Set<string>();

    this.lastActionTime = 0;
    this.pendingUnoPlayerIndex = null;
  }

  toJson() {
    return {
      roomName: this.roomName,
      cardTheme: this.cardTheme,
      expectedPlayers: this.expectedPlayers,
      players: this.players.map((player) => ({
        name: player._name,
        isBot: player._isBot,
        handSize: player._hand.length,
      })),
      connectedPlayers: Array.from(this.connectedPlayers),
      deck: this.deck.toArray(),
      discard: this.discard.toArray(),
      currentFamily: this.currentFamily,
      currentDirection: this.currentDirection,
      currentPlayerIndex: this.currentPlayerIndex,
      createdAt: this.createdAt,
      turnStartTime: this.turnStartTime,
      state: this.state,
      lastActionTime: this.lastActionTime,
      pendingUnoPlayerIndex: this.pendingUnoPlayerIndex,
    };
  }

  addBots(): void {
    for (let i = 0; i < this.botNbr; i++) {
      const botName = generateNickname();
      this.players.push(new UnoPlayer(botName + "_id", botName, null, true));
    }
  }

  addPlayer(player: UnoPlayer): boolean {
    const realPlayersCount = this.players.filter((existingPlayer) => !existingPlayer._isBot).length;

    if (realPlayersCount >= this.realPlayersNbr) {
      return false;
    }

    this.players.push(player);

    return true;
  }

  removePlayer(playerId: string): boolean {
    const playerIndex = this.players.findIndex((player) => player._id === playerId);

    if (playerIndex === -1) {
      return false;
    }

    this.players.splice(playerIndex, 1);
    return true;
  }
}
