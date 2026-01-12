import { card } from "./card";

export class player {
  constructor(
    public _name: string,
    public _uid: string,
    public _isBot: boolean,
  ) {}

  _hand: card[];
}
