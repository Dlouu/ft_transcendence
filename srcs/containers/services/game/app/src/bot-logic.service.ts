import { GameDebugService } from './game-debug.service';
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { Game } from "./domain/UnoGame";
import { GameState } from "./domain/GameEnums";
import { GamePlayService } from "./game-play.service";
import { GameService } from "./game.service";
import { GameLogicService } from "./game-logic.service";
import { CardDto } from './dto/card.dto';
import { Card } from './domain/UnoCard';
import { BotScoringService, PlayableBotCard as RawPlayableBotCard } from './bot-scoring.service';

type PlayableBotCard = {
	card: Card;
	handIndex: number;
	score: number;
};

// Handles bot decision making and automated turn progression.
@Injectable()
export class BotLogicService {
	private static readonly BOT_TURN_DELAY_MS = 100; // TODO: Change to random
	private static readonly BOT_SELF_UNO_REACTION_MIN_DELAY_MS = 850;
	private static readonly BOT_SELF_UNO_REACTION_MAX_DELAY_MS = 3000;
	private static readonly BOT_COUNTER_UNO_REACTION_MIN_DELAY_MS = 900;
	private static readonly BOT_COUNTER_UNO_REACTION_MAX_DELAY_MS = 3200;
	private static readonly BOT_SELF_UNO_SHOUT_CHANCE = 0.9;
	private static readonly BOT_CATCH_PLAYER_UNO_CHANCE = 1;

	constructor(
		@Inject(forwardRef(() => GamePlayService))
		private readonly gamePlayService: GamePlayService,
		@Inject(forwardRef(() => GameService))
		private readonly gameService: GameService,
		@Inject(forwardRef(() => GameLogicService))
		private readonly gameLogicService: GameLogicService,
		private readonly botScoringService: BotScoringService,
		@Inject(forwardRef(() => GameDebugService))
		private readonly gameDebugService: GameDebugService,
	) {}

	getPlayableCards(game: Game, botIndex: number): PlayableBotCard[] {
		const bot = game.getPlayerByIndex(botIndex);
		const topCard = game.discard.peek();
		const playableCards: RawPlayableBotCard[] = bot._hand
			.map((card, handIndex) => ({ card, handIndex }))
			.filter(({ card }) => {
				const cardDto: CardDto = {
					cardCode: card.value,
					cardFamily: card.family,
				};

				return this.gameLogicService.isPlayable(topCard, cardDto);
			});

		const scoredPlayableCards = this.botScoringService.scorePlayableCards(
			game,
			botIndex,
			playableCards,
		);

		return scoredPlayableCards.map(({ card, handIndex, score }) => ({
			card,
			handIndex,
			score,
		}));
	}

	private delayBotTurn(): Promise<void> {
		return new Promise((resolve) => {
			setTimeout(resolve, BotLogicService.BOT_TURN_DELAY_MS);
		});
	}

	private getRandomDelay(minMs: number, maxMs: number): number {
		return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
	}

	private pickRandomBotId(game: Game, excludeBotId?: string): string | null {
		const bots = game.players.filter(
			(player) => player._isBot && player._id !== excludeBotId,
		);
		if (bots.length === 0) {
			return null;
		}

		const randomIndex = Math.floor(Math.random() * bots.length);
		return bots[randomIndex]._id;
	}

	private scheduleBotUnoAttempt(
		game: Game,
		pendingPlayerId: string,
		shouterId: string,
		chance: number,
		minDelayMs: number,
		maxDelayMs: number,
	): void {
		if (Math.random() > chance) {
			return;
		}

		const reactionDelay = this.getRandomDelay(minDelayMs, maxDelayMs);

		setTimeout(() => {
			const currentPendingIndex = game.pendingUnoPlayerIndex;
			if (currentPendingIndex === null) {
				return;
			}

			const currentPendingPlayer = game.players[currentPendingIndex];
			if (
				!currentPendingPlayer ||
				currentPendingPlayer._id !== pendingPlayerId ||
				currentPendingPlayer._hand.length !== 1
			) {
				return;
			}

			this.gameService.shoutUno(shouterId, game);
		}, reactionDelay);
	}

	scheduleUnoReaction(game: Game): void {
		const pendingIndex = game.pendingUnoPlayerIndex;
		if (pendingIndex === null) {
			return;
		}

		const pendingPlayer = game.players[pendingIndex];
		if (!pendingPlayer || pendingPlayer._hand.length !== 1) {
			return;
		}

		const pendingPlayerId = pendingPlayer._id;

		if (pendingPlayer._isBot) {
			this.scheduleBotUnoAttempt(
				game,
				pendingPlayerId,
				pendingPlayerId,
				BotLogicService.BOT_SELF_UNO_SHOUT_CHANCE,
				BotLogicService.BOT_SELF_UNO_REACTION_MIN_DELAY_MS,
				BotLogicService.BOT_SELF_UNO_REACTION_MAX_DELAY_MS,
			);

			const counterBotId = this.pickRandomBotId(game, pendingPlayerId);
			if (counterBotId) {
				this.scheduleBotUnoAttempt(
					game,
					pendingPlayerId,
					counterBotId,
					BotLogicService.BOT_CATCH_PLAYER_UNO_CHANCE,
					BotLogicService.BOT_COUNTER_UNO_REACTION_MIN_DELAY_MS,
					BotLogicService.BOT_COUNTER_UNO_REACTION_MAX_DELAY_MS,
				);
			}

			return;
		}

		const counterBotId = this.pickRandomBotId(game);
		if (!counterBotId) {
			return;
		}

		this.scheduleBotUnoAttempt(
			game,
			pendingPlayerId,
			counterBotId,
			BotLogicService.BOT_CATCH_PLAYER_UNO_CHANCE,
			BotLogicService.BOT_COUNTER_UNO_REACTION_MIN_DELAY_MS,
			BotLogicService.BOT_COUNTER_UNO_REACTION_MAX_DELAY_MS,
		);
	}

	async playTurn(game: Game, botIndex: number): Promise<void> {
		await this.delayBotTurn();

		if (!this.gameService.isGameActive(game) || game.state !== GameState.PLAYING) {
			return;
		}

		const bot = game.getPlayerByIndex(botIndex);
		const playableCards = this.getPlayableCards(game, botIndex);
		if (playableCards.length === 0) {
			this.gameService.drawCard(bot._id, game);
			return;
		}

		const bestCard = playableCards.reduce((best, current) =>
			current.score > best.score ? current : best,
		);

		const cardDto: CardDto = {
			cardCode: bestCard.card.value,
			cardFamily: bestCard.card.family,
		};

		await this.gameService.playCard(bot._id, cardDto, game);
	}
}
