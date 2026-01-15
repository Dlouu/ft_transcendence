import { playerInfo } from './../dto/create-game.dto';
import { player } from "./player";
import { card, CardColor } from "./card";

export enum GameState
{
    WAITING_FOR_PLAYERS,
    DEALING,
    PLAYING,
    AWAITING_COLOR_CHOICE,
    GAME_OVER,
}

export class game {
  constructor(name: string, players: playerInfo[], playerNbr: number) {
    this.roomName = name;
    this.players = [];

    for (let i = 0; i < playerNbr; i++) {
      const p = new player(players.at(i)?.name || "pName_" + i, players.at(i)?.isAi || true);
      this.players.push(p);
    }

    this.realPlayersNbr = playerNbr;

    this.currentPlayerIndex = 0;
    this.currentDirection = "CLOCKWISE";

    this.discard = [];

    this.createdAt = Date.now();
  }

  roomName: string;

  players: player[];
  connectedPlayers: Set<string>;
  realPlayersNbr: number;

  deck: card[];
  discard: card[];
  currentColor: CardColor;
  currentDirection: "CLOCKWISE" | "COUNTER-CLOCKWISE";
  currentPlayerIndex: number;

  createdAt: number; // Timestamp of room creation
  turnStartTime: number; // Timestamp

  state: GameState;
}
