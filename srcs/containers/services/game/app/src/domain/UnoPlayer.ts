import { Card } from "./UnoCard";
import { Socket } from "socket.io";

export class UnoPlayer {
  constructor(
    public _name: string, // To replace by uids
    public _id: string,
    public _isBot: boolean,
    public _socket: Socket | null,
  ) {}

  _hand: Card[] = [];
}
