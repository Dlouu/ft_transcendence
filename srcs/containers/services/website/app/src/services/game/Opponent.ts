import { Texture } from "pixi.js";
import { Hand } from "./Hand";

export class Opponent {
	public _name: string;
	public _cardBack: Texture;
	private _hand: Hand;

	constructor(
		name: string = "default",
		cardBack: Texture = Texture.EMPTY,
		hand: Hand
	)
	{
		this._name = name;
		this._cardBack = cardBack;
		this._hand = hand;
	}
}