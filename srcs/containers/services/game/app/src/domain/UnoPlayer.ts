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
	private _win_game: boolean = false;
	private _nbr_uno: number = 0;
	private _nbr_uwu: number = 0;
	private _nbr_4cards: number = 0;
	private _nbr_drew: number = 0;
	private _biggest_hand: number = 0;

	constructor(
		public _id: string,
		public _name: string = generateNickname(),
		public _socket: Socket | null = null,
		public _isBot: boolean = false,
		public _cardBack: string = "uwu",
	) {}

	_hand: Card[] = [];

	private normalizeNonNegativeInt(value: number): number {
		if (!Number.isFinite(value) || value < 0) {
			return 0;
		}

		return Math.floor(value);
	}

	get win_game(): boolean {
		return this._win_game;
	}

	set win_game(value: boolean) {
		this._win_game = value;
	}

	get nbr_uno(): number {
		return this._nbr_uno;
	}

	set nbr_uno(value: number) {
		this._nbr_uno = this.normalizeNonNegativeInt(value);
	}

	get nbr_uwu(): number {
		return this._nbr_uwu;
	}

	set nbr_uwu(value: number) {
		this._nbr_uwu = this.normalizeNonNegativeInt(value);
	}

	get nbr_4cards(): number {
		return this._nbr_4cards;
	}

	set nbr_4cards(value: number) {
		this._nbr_4cards = this.normalizeNonNegativeInt(value);
	}

	get nbr_drew(): number {
		return this._nbr_drew;
	}

	set nbr_drew(value: number) {
		this._nbr_drew = this.normalizeNonNegativeInt(value);
	}

	get biggest_hand(): number {
		return this._biggest_hand;
	}

	set biggest_hand(value: number) {
		this._biggest_hand = this.normalizeNonNegativeInt(value);
	}

	incrementNbrUno(amount = 1): void {
		const increment = this.normalizeNonNegativeInt(amount);
		this._nbr_uno += increment;
	}

	incrementNbrUwu(amount = 1): void {
		const increment = this.normalizeNonNegativeInt(amount);
		this._nbr_uwu += increment;
	}

	incrementNbr4cards(amount = 1): void {
		const increment = this.normalizeNonNegativeInt(amount);
		this._nbr_4cards += increment;
	}

	incrementNbrDrew(amount = 1): void {
		const increment = this.normalizeNonNegativeInt(amount);
		this._nbr_drew += increment;
	}

	updateBiggestHand(handSize: number): void {
		const normalizedHandSize = this.normalizeNonNegativeInt(handSize);
		this._biggest_hand = Math.max(this._biggest_hand, normalizedHandSize);
	}
}
