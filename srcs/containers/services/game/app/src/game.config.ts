import { CardCode, CardFamily } from "./domain/GameEnums";

export const GAME_CONFIG = {
	turn: {
		turnTimeoutMs: 10000,
		wildColorPickTimeoutMs: 10000,
	},
	uno: {
		revealDelayMs: 500,
		callWindowMs: 100000,
	},
	dealing: {
		startCardsPerPlayer: 7,
	},
	bot: {
		turnDelayMs: {
			min: 500, // 750
			max: 2000, // 2750
		},
		selfUnoReactionDelayMs: {
			min: 200,
			max: 1500,
		},
		counterUnoReactionDelayMs: {
			min: 200,
			max: 2900,
		},
		selfUnoShoutChance: 1,
		catchPlayerUnoChance: 1,
	},
	deck: {
		playableFamilies: [
			CardFamily.ONE,
			CardFamily.TWO,
			CardFamily.THREE,
			CardFamily.FOUR,
		] as const,
		numberCards: [
			CardCode.One,
			CardCode.Two,
			CardCode.Three,
			CardCode.Four,
			CardCode.Five,
			CardCode.Six,
			CardCode.Seven,
			CardCode.Eight,
			CardCode.Nine,
		] as const,
		duplicatePerColor: {
			numberCards: 2,
			actionCards: 2,
		},
		wildCopies: 4,
	},
} as const;
