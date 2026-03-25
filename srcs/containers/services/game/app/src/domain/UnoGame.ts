import { generateNickname, UnoPlayer } from "./UnoPlayer";
import { CardFamily, GameState } from "./GameEnums";
import { DeckPile } from "./DeckPile";

export interface ExpectedPlayer {
  id: string;
  name: string;
  cardBackUrl: string;
}

export class Game {
  public roomName: string;
  public cardTheme: "basic" | "uwu";
  private _winner_player_id: string | null;

  public players: UnoPlayer[];
  public connectedPlayers: Set<string>;
  public expectedPlayers: ExpectedPlayer[];
  private realPlayersNbr: number;
  private botNbr: number;

  public deck: DeckPile;
  public discard: DeckPile;
  public currentFamily: CardFamily;
  public currentDirection: "CLOCKWISE" | "COUNTER-CLOCKWISE";
  public currentPlayerIndex: number;

  public createdAt: number; // Timestamp of room creation
  public turnStartTime: number; // Timestamp of turn start
  public lastActionTime: number;
  public turnCount: number;
  public pendingUnoPlayerIndex: number | null;

  public state: GameState;

  constructor(
    name: string,
    players: ExpectedPlayer[],
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

    this.connectedPlayers = new Set<string>();

    this.lastActionTime = 0;
    this.turnCount = 0;
    this.pendingUnoPlayerIndex = null;
    this._winner_player_id = null;
  }

  private normalizeNonNegativeInt(value: number): number {
    if (!Number.isFinite(value) || value < 0) {
      return 0;
    }

    return Math.floor(value);
  }

  get winner_player_id(): string | null {
    return this._winner_player_id;
  }

  set winner_player_id(value: string | null) {
    this._winner_player_id = value;
  }

  isExpectedPlayer(playerId: string): boolean {
    return this.expectedPlayers.some((player) => player.id === playerId);
  }

  getExpectedPlayer(playerId: string): ExpectedPlayer | undefined {
    return this.expectedPlayers.find((player) => player.id === playerId);
  }

  getExpectedPlayerIds(): string[] {
    return this.expectedPlayers.map((player) => player.id);
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
        cardBack: player._cardBack,
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
      turnCount: this.turnCount,
      pendingUnoPlayerIndex: this.pendingUnoPlayerIndex,
      winnerPlayerId: this.winner_player_id,
    };
  }

  addBots(): void {
    const usedNames = new Set(this.players.map((player) => player._name));

    for (let i = 0; i < this.botNbr; i++) {
      let botName = generateNickname();

      while (usedNames.has(botName)) {
        botName = generateNickname();
      }

      usedNames.add(botName);
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

  getPlayerByIndex(index: number): UnoPlayer {
    if (!Number.isInteger(index)) {
      throw new Error("Player index must be an integer.");
    }

    if (index < 0 || index >= this.players.length) {
      throw new Error("Player index is out of bounds.");
    }

    return this.players[index];
  }
}
