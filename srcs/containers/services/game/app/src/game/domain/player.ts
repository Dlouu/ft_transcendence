import { card } from "./card";
import { Socket } from "socket.io";

export class player {
  constructor(
    public _name: string, // To replace by uids
    public _isBot: boolean,
    public _socket: Socket | null,
  ) {}

  _hand: card[] = [];
}
