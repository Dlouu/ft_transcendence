import { UnoPlayer } from "./UnoPlayer";
import { Card, CardFamily } from "./UnoCard";

export enum GameState {
  WAITING_FOR_PLAYERS,
  DEALING,
  PLAYING,
  AWAITING_COLOR_CHOICE,
  GAME_OVER,
}

export class Game {
  constructor(
    name: string,
    players: string[], // To replace by uids
    playerNbr: number,
    botNbr: number,
  ) {
    this.roomName = name;
    this.players = [];

    for (let i = 0; i < playerNbr; i++) {
      const p = new UnoPlayer(players[i], players[i], false, null);
      this.players.push(p);
    }

    for (let i = 0; i < botNbr; i++) {
      const p = new UnoPlayer("bot_" + i, "bot_" + i, true, null);
      this.players.push(p);
    }

    this.currentPlayerIndex = 0;
    this.currentDirection = "CLOCKWISE";

    this.discard = [];

    this.createdAt = Date.now();

    this.connectedPlayers = new Set<string>();

    this.lastActionTime = 0;
    this.pendingUnoPlayerIndex = null;
    this.unoShouted = false;
    this.hasDrawnThisTurn = false;
  }

  toJson() {
    return {
      roomName: this.roomName,
      players: this.players.map((player) => ({
        name: player._name,
        isBot: player._isBot,
        handSize: player._hand.length,
      })),
      connectedPlayers: Array.from(this.connectedPlayers),
      deck: this.deck,
      discard: this.discard,
      currentFamily: this.currentFamily,
      currentDirection: this.currentDirection,
      currentPlayerIndex: this.currentPlayerIndex,
      createdAt: this.createdAt,
      turnStartTime: this.turnStartTime,
      state: this.state,
      lastActionTime: this.lastActionTime,
      pendingUnoPlayerIndex: this.pendingUnoPlayerIndex,
      unoShouted: this.unoShouted,
    };
  }

  roomName: string;

  players: UnoPlayer[];
  connectedPlayers: Set<string>;
  realPlayersNbr: number;

  deck: Card[];
  discard: Card[];
  currentFamily: CardFamily;
  currentDirection: "CLOCKWISE" | "COUNTER-CLOCKWISE";
  currentPlayerIndex: number;

  createdAt: number; // Timestamp of room creation
  turnStartTime: number; // Timestamp
  lastActionTime: number;
  pendingUnoPlayerIndex: number | null;
  unoShouted: boolean;
  hasDrawnThisTurn: boolean;

  state: GameState;
}
