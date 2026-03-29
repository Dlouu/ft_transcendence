import { Injectable } from "@nestjs/common";
import { CardCode, CardFamily } from "./domain/GameEnums";
import { Game } from "./domain/UnoGame";
import { Card, isNumberCard } from "./domain/UnoCard";

export type PlayableBotCard = {
	card: Card;
	handIndex: number;
};

export type ScoreBreakdown = {
	baseScore: number;
	colorControl: number;
	singleColorBonus: number;
	zeroColorPenalty: number;
	attackValue: number;
	resourceValue: number;
	total: number;
};

export type ScoredBotCard = PlayableBotCard & {
	chosenFamily: CardFamily;
	breakdown: ScoreBreakdown;
	score: number;
};

// Handles bot card scoring to know which one play.
@Injectable()
export class BotScoringService {
	private readonly regularFamilies: CardFamily[] = [
		CardFamily.ONE,
		CardFamily.TWO,
		CardFamily.THREE,
		CardFamily.FOUR,
	];

	constructor() {}

	scorePlayableCards(
		game: Game,
		botIndex: number,
		playableCards: PlayableBotCard[],
	): ScoredBotCard[] {
		return playableCards.map((playableCard) =>
			this.scoreCard(game, botIndex, playableCard),
		);
	}

	scoreCard(
		game: Game,
		botIndex: number,
		playableCard: PlayableBotCard,
	): ScoredBotCard {
		const bot = game.getPlayerByIndex(botIndex);
		const handBeforePlay = bot._hand;
		const handAfterPlay = handBeforePlay.filter(
			(_, index) => index !== playableCard.handIndex,
		);

		const card = playableCard.card;
		const candidateFamilies = this.getCandidateFamilies(card);

		let bestScoredCard: ScoredBotCard | null = null;

		for (const chosenFamily of candidateFamilies) {
			const baseScore = this.getBaseScore(card.value, game.players.length);
			const colorControl = this.getColorControl(chosenFamily, handAfterPlay);
			const singleColorBonus = this.getSingleColorBonus(handAfterPlay);
			const zeroColorPenalty = this.getZeroColorPenalty(card, chosenFamily, handAfterPlay);
			const attackValue = this.getAttackValue(game, botIndex, card.value);
			const resourceValue = this.getResourceAdjustment(card.value, handBeforePlay.length);

			const total =
				baseScore +
				colorControl +
				singleColorBonus +
				zeroColorPenalty +
				attackValue +
				resourceValue;

			const scoredCard: ScoredBotCard = {
				...playableCard,
				chosenFamily,
				breakdown: {
					baseScore,
					colorControl,
					singleColorBonus,
					zeroColorPenalty,
					attackValue,
					resourceValue,
					total,
				},
				score: total,
			};

			if (!bestScoredCard || scoredCard.score > bestScoredCard.score) {
				bestScoredCard = scoredCard;
			}
		}

		if (!bestScoredCard) {
			throw new Error("Unable to score playable card.");
		}

		return bestScoredCard;
	}

	private getCandidateFamilies(card: Card): CardFamily[] {
		if (this.isWildCard(card.value)) {
			return this.regularFamilies;
		}

		return [card.family];
	}

	private isWildCard(cardCode: CardCode): boolean {
		return cardCode === CardCode.Wild || cardCode === CardCode.WildDrawFour;
	}

	private getBaseScore(cardCode: CardCode, playerCount: number): number {
		if (isNumberCard(cardCode)) {
			return 1;
		}

		switch (cardCode) {
			case CardCode.Skip:
				return 3;
			case CardCode.Reverse:
				return playerCount === 2 ? 4 : 2;
			case CardCode.DrawTwo:
				return 4;
			case CardCode.Wild:
				return 3;
			case CardCode.WildDrawFour:
				return 5;
			default:
				return 0;
		}
	}

	private getColorControl(chosenFamily: CardFamily, handAfterPlay: Card[]): number {
		const sameColorCount = handAfterPlay.filter(
			(card) => card.family === chosenFamily,
		).length;

		return sameColorCount * 2;
	}

	private getSingleColorBonus(handAfterPlay: Card[]): number {
		if (handAfterPlay.length === 0) {
			return 0;
		}

		const nonWildFamilies = new Set(
			handAfterPlay
				.filter((card) => card.family !== CardFamily.WILD)
				.map((card) => card.family),
		);

		return nonWildFamilies.size <= 1 ? 3 : 0;
	}

	private getZeroColorPenalty(
		card: Card,
		chosenFamily: CardFamily,
		handAfterPlay: Card[],
	): number {
		if (!this.isWildCard(card.value)) {
			return 0;
		}

		const chosenFamilyCount = handAfterPlay.filter(
			(currentCard) => currentCard.family === chosenFamily,
		).length;

		return chosenFamilyCount === 0 ? -4 : 0;
	}

	private getAttackValue(game: Game, botIndex: number, cardCode: CardCode): number {
		const targetIndex = this.getAttackTargetIndex(game, botIndex, cardCode);
		const targetPlayer = game.players[targetIndex];

		if (!targetPlayer) {
			return 0;
		}

		const nextPlayerHandSize = targetPlayer._hand.length;
		let attackValue = 0;

		if (nextPlayerHandSize <= 2) {
			if (cardCode === CardCode.Skip) {
				attackValue += 6;
			}
			if (cardCode === CardCode.Reverse && game.players.length === 2) {
				attackValue += 6;
			}
			if (cardCode === CardCode.DrawTwo) {
				attackValue += 7;
			}
			if (cardCode === CardCode.WildDrawFour) {
				attackValue += 10;
			}
		} else if (nextPlayerHandSize <= 4) {
			if (cardCode === CardCode.Skip) {
				attackValue += 3;
			}
			if (cardCode === CardCode.DrawTwo) {
				attackValue += 4;
			}
			if (cardCode === CardCode.WildDrawFour) {
				attackValue += 5;
			}
		}

		if (nextPlayerHandSize > 6) {
			attackValue *= 0.5;
		}

		return attackValue;
	}

	private getAttackTargetIndex(game: Game, botIndex: number, cardCode: CardCode): number {
		const directionStep = game.currentDirection === "CLOCKWISE" ? 1 : -1;
		const playerCount = game.players.length;

		if (cardCode === CardCode.Reverse && playerCount > 2) {
			const reverseStep = -directionStep;
			return this.wrapIndex(botIndex + reverseStep, playerCount);
		}

		return this.wrapIndex(botIndex + directionStep, playerCount);
	}

	private wrapIndex(index: number, modulo: number): number {
		return ((index % modulo) + modulo) % modulo;
	}

	private getResourceAdjustment(cardCode: CardCode, handSize: number): number {
		let score = 0;

		if (handSize > 5) {
			if (cardCode === CardCode.WildDrawFour) {
				score -= 4;
			}
			if (cardCode === CardCode.DrawTwo) {
				score -= 2;
			}
			if (cardCode === CardCode.Skip) {
				score -= 1;
			}
		}

		if (handSize <= 3) {
			if (!isNumberCard(cardCode)) {
				score += 3;
			}
			if (cardCode === CardCode.WildDrawFour) {
				score += 5;
			}
		}

		return score;
	}
}
