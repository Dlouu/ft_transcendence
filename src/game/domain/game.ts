import { player } from "./player";
import { card, CardFamily } from "./card";

export enum GameState {
  WAITING_FOR_PLAYERS,
  DEALING,
  PLAYING,
  AWAITING_COLOR_CHOICE,
  GAME_OVER,
}

export class game {
  constructor(
    name: string,
    players: string[], // To replace by uids
    playerNbr: number,
    botNbr: number,
  ) {
    this.roomName = name;
    this.players = [];

    for (let i = 0; i < playerNbr; i++) {
      const p = new player(players[i], false);
      this.players.push(p);
    }

    for (let i = 0; i < botNbr; i++) {
      const p = new player("bot_" + i, true);
      this.players.push(p);
    }

    this.currentPlayerIndex = 0;
    this.currentDirection = "CLOCKWISE";

    this.discard = [];

    this.createdAt = Date.now();

    this.connectedPlayers = new Set<string>();
  }

  toJson() {
    return {
      roomName: this.roomName,
      players: this.players,
      connectedPlayers: Array.from(this.connectedPlayers),
      deck: this.deck,
      discard: this.discard,
      currentFamily: this.currentFamily,
      currentDirection: this.currentDirection,
      currentPlayerIndex: this.currentPlayerIndex,
      createdAt: this.createdAt,
      turnStartTime: this.turnStartTime,
      state: this.state,
    };
  }

  roomName: string;

  players: player[];
  connectedPlayers: Set<string>;
  realPlayersNbr: number;

  deck: card[];
  discard: card[];
  currentFamily: CardFamily;
  currentDirection: "CLOCKWISE" | "COUNTER-CLOCKWISE";
  currentPlayerIndex: number;

  createdAt: number; // Timestamp of room creation
  turnStartTime: number; // Timestamp

  state: GameState;
}
