import { Card } from "./UnoCard";
import { Socket } from "socket.io";

const COLORS = [
	"red",
	"blue",
	"green",
	"yellow",
	"purple",
	"orange",
	"cyan",
	"magenta",
	"teal",
	"indigo",
	"amber",
	"silver",
];
const ADJECTIVES = [
	"brave",
	"swift",
	"clever",
	"wild",
	"mighty",
	"happy",
	"fierce",
	"sneaky",
	"bold",
	"jolly",
	"noble",
	"shiny",
];
const ANIMALS = [
	"tiger",
	"fox",
	"eagle",
	"wolf",
	"bear",
	"otter",
	"panda",
	"falcon",
	"lynx",
	"dolphin",
	"raven",
	"gecko",
];

const pickRandom = (words: string[]): string =>
	words[Math.floor(Math.random() * words.length)];

export const generateNickname = (): string =>
	`${pickRandom(COLORS)}-${pickRandom(ADJECTIVES)}-${pickRandom(ANIMALS)}`;

export class UnoPlayer {
  public hasShoutedUno: boolean = false;
  public hasDrawThisTurn: boolean = false;

	constructor(
		public _id: string,
		public _name: string = generateNickname(), // To replace by uids
		public _socket: Socket | null = null,
		public _isBot: boolean = false,
		public _cardBack: string = "uwu",
	) {}

	_hand: Card[] = [];
}
