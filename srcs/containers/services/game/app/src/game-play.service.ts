import { Logger } from 'winston';
import { GameLogicService } from './game-logic.service';
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { DeckService } from "./deck.service";
import { CardDto } from './dto/card.dto';
import { Game } from './domain/UnoGame';
import { CardCode, GameState } from './domain/GameEnums';
import { Card } from './domain/UnoCard';
import { UnoPlayer } from './domain/UnoPlayer';
import { toPlayedCardDto } from './dto/played-card.dto';
import { GameService } from './game.service';
import { GameRepositoryService } from './game-repository';
import { NextTurnDto } from './dto/next-turn.dto';
import { GameLoggerService } from './logger.service';

// Handles the inputs of the players of the game (play card, draw, uno).
@Injectable()
export class GamePlayService {
	constructor(
		private readonly deckService: DeckService,
		private readonly gameLogicService: GameLogicService,
		private readonly gameRepository: GameRepositoryService,
		@Inject(forwardRef(() => GameService))
		private readonly gameService: GameService,
		private readonly logger: GameLoggerService,
	) {}

	private getIoServer() {
		return this.gameService.getServer();
	}

	// ============================
	// ======= CARD PLAYING =======
	// ============================

	playValueCard(game: Game, playedCard: Card): boolean {
		game.discard.push(playedCard);
		game.currentFamily = playedCard.family;

		return true;
	}

	playSkipCard(game: Game, playedCard: Card): boolean {
		game.discard.push(playedCard);
		game.currentFamily = playedCard.family;

		return true;
	}

	playReverseCard(game: Game, playedCard: Card): boolean {
		game.discard.push(playedCard);
		game.currentFamily = playedCard.family;

		this.gameLogicService.reverseTurnOrder(game);

		this.getIoServer()?.to(game.roomName).emit("game:turn:reverse")

		this.logger.turnDirectionChanged(game.roomName, game.currentDirection);

		return true;
	}

	playDrawTwoCard(game: Game, playedCard: Card): boolean {
		game.discard.push(playedCard);
		game.currentFamily = playedCard.family;
		const targetPlayer = this.gameLogicService.getNextPlayer(game);

		this.drawCard(game, 2, true, targetPlayer);

		this.logger.drawCard(targetPlayer._id, targetPlayer._name, game.roomName, 4, "Player took a draw two.");

		return true;
	}

	async playWildCard(game: Game, playedCard: Card, player: UnoPlayer): Promise<boolean> {
		game.discard.push(playedCard);

		const chosenFamily = await this.gameLogicService.askPlayerColor(game, player);
		console.log(`Choosen color: ${chosenFamily}`);
		game.currentFamily = chosenFamily;
		playedCard.family = chosenFamily;
		this.getIoServer()?.to(game.roomName).emit("game:wild:new-color", { chosenFamily });
		console.log(`Wild current family : ${game.currentFamily}`);

		return true;
	}

	async playWildDrawFourCard(game: Game, playedCard: Card, player: UnoPlayer): Promise<boolean> {
		game.discard.push(playedCard);
		const targetPlayer = this.gameLogicService.getNextPlayer(game);

		const chosenFamily = await this.gameLogicService.askPlayerColor(game, player);
		console.log(`Choosen color: ${chosenFamily}`);
		this.drawCard(game, 4, true, targetPlayer);

		this.logger.drawCard(targetPlayer._id, targetPlayer._name, game.roomName, 4, "Player took a draw four.");

		game.currentFamily = chosenFamily;
		playedCard.family = chosenFamily;
		this.getIoServer()?.to(game.roomName).emit("game:wild:new-color", { chosenFamily });
		console.log(`Wild current family : ${game.currentFamily}`);

		return true;
	}

	async playCard(game: Game, dto: CardDto, player: UnoPlayer): Promise<boolean> {
		if (!this.gameLogicService.isPlayersTurn(game, player))
		{
			this.logger.invalidAction(
				player._id,
				player._name,
				game.roomName,
				"play_card_out_of_turn",
			);
			return false;
		}

		const cardIndex = this.gameLogicService.doesPlayerHaveCard(dto, player);
		if (cardIndex === -1)
		{
			this.logger.invalidAction(
				player._id,
				player._name,
				game.roomName,
				`play_card_not_in_hand:${dto.cardCode}:${dto.cardFamily}`,
			);
			return false;
		}

		const [playedCard] = player._hand.splice(cardIndex, 1);
		if (!playedCard) {
			return false;
		}

		const topCard = game.discard.peek();
		if (!this.gameLogicService.isPlayable(topCard, dto))
		{
			this.logger.invalidAction(
				player._id,
				player._name,
				game.roomName,
				`play_card_not_playable:${dto.cardCode}:${dto.cardFamily}`,
			);
			player._hand.splice(cardIndex, 0, playedCard);
			return false;
		}

		if (!player._isBot && player._socket)
		{
			player._socket.emit("game:played:card:self", toPlayedCardDto(player._name, playedCard, cardIndex));
			player._socket.to(game.roomName).emit("game:played:card:others", toPlayedCardDto(player._name, playedCard, cardIndex));
		}
		else
			this.getIoServer()?.to(game.roomName).emit("game:played:card:others", toPlayedCardDto(player._name, playedCard, cardIndex));
		
		if (game.deck.length === 0)
		{
			this.deckService.discardToDeck(game);
			this.getIoServer()?.to(game.roomName).emit("game:deck:shuffled");
		}

		let hasBeenPlayed = false;
		switch (dto.cardCode) {
			case CardCode.Reverse:
				hasBeenPlayed = this.playReverseCard(game, playedCard);
				break;
			case CardCode.Skip:
				hasBeenPlayed = this.playSkipCard(game, playedCard);
				break;
			case CardCode.DrawTwo:
				hasBeenPlayed = this.playDrawTwoCard(game, playedCard);
				break;
			case CardCode.Wild:
				hasBeenPlayed = await this.playWildCard(game, playedCard, player);
				break;
			case CardCode.WildDrawFour:
				hasBeenPlayed = await this.playWildDrawFourCard(game, playedCard, player);
				break;

			default:
				hasBeenPlayed = this.playValueCard(game, playedCard);
				break;
		}

		if (!hasBeenPlayed) {
			player._hand.splice(cardIndex, 0, playedCard);
			return false;
		}

		this.logger.cardPlayed(player._id, player._name, game.roomName, dto.cardCode, dto.cardFamily);

		return true;
	}

	// =================================
	// ======= BUTTON UNO EFFECT =======
	// =================================

	shoutUno(game: Game, player: UnoPlayer): boolean
	{
		const unoPenaltyCards = 2;

		const pendingIndex = game.pendingUnoPlayerIndex;
		if (pendingIndex === null) {
			return false;
		}

		const pendingPlayer = game.players[pendingIndex];
		if (!pendingPlayer || pendingPlayer._hand.length !== 1) {
			this.gameLogicService.clearPendingUno(game);
			return false;
		}

		if (pendingPlayer._id === player._id) {
			pendingPlayer.hasShoutedUno = true;
			this.gameLogicService.clearPendingUno(game);

			this.getIoServer()?.to(game.roomName).emit("game:uno:catched");

			return true;
		}

		this.gameLogicService.clearPendingUno(game);
		if (!this.drawCard(game, unoPenaltyCards, true, pendingPlayer)) {
			this.getIoServer()?.to(game.roomName).emit("game:uno:catched");
			return false;
		}

		this.getIoServer()?.to(game.roomName).emit("game:uno:catched");

		const isPendingUnoPlayer = pendingPlayer._id === player._id;

		this.logger.unoCalled(player._id, player._name, game.roomName, isPendingUnoPlayer);

		return true;
	}

	// ================================
	// ======= DECK DRAW EFFECT =======
	// ================================

	drawCard(game: Game, iterNbr: number, isDrawCard: boolean, player: UnoPlayer): boolean
	{
		if (!this.gameLogicService.isPlayersTurn(game, player) && !isDrawCard)
		{
			this.logger.invalidAction(
				player._id,
				player._name,
				game.roomName,
				"draw_card_out_of_turn",
			);
			return false;
		}

		const drawResult = this.gameLogicService.drawCardsWithEvents(game, player, iterNbr);
		if (!drawResult.success)
		{
			if (!isDrawCard && drawResult.deckEmpty)
			{
				game.turnCount += 1;
				this.gameLogicService.goToNextPlayerIndex(game);

				const now = Date.now();
				game.lastActionTime = now;
				game.turnStartTime = now;
				
				const nextTurnDto: NextTurnDto = {
					currentPlayerIndex: game.currentPlayerIndex,
					turnDirection: game.currentDirection,
				};

				this.getIoServer()?.to(game.roomName).emit("game:nextTurn", nextTurnDto);
			}

			return false;
		}

		return true;
	}
}
