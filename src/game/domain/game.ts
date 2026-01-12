import { player } from "./player";
import { card, CardColor } from "./card";

export class game {
  constructor(name: string, playersUID: string[], playerNbr: number) {
    this.roomName = name;
    this.players = [];

    for (let i = 0; i < playerNbr; i++) {
      const p = new player("pName_" + i, playersUID.at(i) || "UID_" + i, false);
      this.players.push(p);
    }
  }
  roomName: string;

  players: player[];

  deck: card[];
  discard: card[];
  currentColor: CardColor;
  currentDirection: "CLOCKWISE" | "COUNTER-CLOCKWISE";

  createdAt: number; // Timestamp of room creation
  turnStartTime: number; // Timestamp
}
