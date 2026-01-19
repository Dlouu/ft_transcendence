import { card } from "./card";

export class player {
  constructor(
    public _name: string, // To replace by uids
    public _isBot: boolean,
  ) {}

  _hand: card[] = [];
}
