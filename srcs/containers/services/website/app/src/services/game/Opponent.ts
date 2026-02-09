import { Texture } from "pixi.js";

export class Opponent {
	public _name: string;
	public _cardBack: Texture;

	constructor(
		name: string = "default",
		cardBack: Texture = Texture.EMPTY
	)
	{
		this._name = name;
		this._cardBack = cardBack;
	}
}