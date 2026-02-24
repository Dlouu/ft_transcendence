import { GameLogicService } from './game-logic.service';
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { DeckService } from "./deck.service";
import { GameRepositoryService } from "./game-repository";
import { CardDto } from './dto/card.dto';
import { Game } from './domain/UnoGame';
import { CardCode, CardFamily } from './domain/GameEnums';
import { Card } from './domain/UnoCard';
import { UnoPlayer } from './domain/UnoPlayer';
import { toPlayedCardDto } from './dto/played-card.dto';
import { GameService } from './game.service';
import { getServers } from 'dns';
import { toDrewCardDto } from './dto/drawn-card.dto';

// Handles the inputs of the players of the game (play card, draw, uno).
@Injectable()
export class GamePlayService {
	constructor(
		private readonly deckService: DeckService,
		private readonly gameRepository: GameRepositoryService,
		private readonly gameLogicService: GameLogicService,
		@Inject(forwardRef(() => GameService))
		private readonly gameService: GameService,
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

		this.gameLogicService.goToNextPlayerIndex(game);

		return true;
	}

	playReverseCard(game: Game, playedCard: Card): boolean {
		game.discard.push(playedCard);
		game.currentFamily = playedCard.family;

		this.gameLogicService.reverseTurnOrder(game);

		if (game.players.length === 2)
			this.gameLogicService.goToNextPlayerIndex(game);

		this.getIoServer()?.to(game.roomName).emit("game:turn:reverse")

		return true;
	}

	playDrawTwoCard(playerId: string, game: Game, playedCard: Card): boolean {
		game.discard.push(playedCard);
		game.currentFamily = playedCard.family;

		this.drawCard(playerId, game, 2);
		this.gameLogicService.goToNextPlayerIndex(game);

		return true;
	}

	async playWildCard(game: Game, playedCard: Card, player: UnoPlayer): Promise<boolean> {
		game.discard.push(playedCard);
		game.currentFamily = playedCard.family;

		const chosenFamily = await this.gameLogicService.askPlayerColor(game, player);
		console.log(`Choosen color: ${chosenFamily}`);

		return true;
	}

	async playWildDrawFourCard(game: Game, playedCard: Card, player: UnoPlayer): Promise<boolean> {
		game.discard.push(playedCard);
		game.currentFamily = playedCard.family;

		const chosenFamily = await this.gameLogicService.askPlayerColor(game, player);
		console.log(`Choosen color: ${chosenFamily}`);

		return true;
	}

	playCard(playerId: string, game: Game, dto: CardDto): boolean {
		const player = this.gameRepository.getPlayerInGame(game, playerId);
		if (!player)
		{
			console.log(`Player ${playerId} is not in the game ${game.roomName}`); // TODO: Replace this console log
			return false;
		}

		if (!this.gameLogicService.isPlayersTurn(game, player))
		{
			console.log(`It's not player ${playerId}'s turn is not in the game ${game.roomName}`); // TODO: Replace this console log
			return false;
		}

		const cardIndex = this.gameLogicService.doesPlayerHaveCard(dto, player);
		if (cardIndex === -1)
		{
			console.log(`Player ${playerId} is not in the game ${game.roomName} does not have the card ${dto.cardCode} ${dto.cardFamily}`); // TODO: Replace this console log
			return false;
		}

		const [playedCard] = player._hand.splice(cardIndex, 1);
		if (!playedCard) {
			return false;
		}

		const topCard = game.discard.peek();
		if (!this.gameLogicService.isPlayable(topCard, dto))
		{
			console.log(`Player ${playerId}'s card is not playable in the game ${game.roomName}`); // TODO: Replace this console log
			player._hand.splice(cardIndex, 0, playedCard);
			return false;
		}

		player._socket?.emit("game:played:card:self", toPlayedCardDto(player._name, playedCard, cardIndex));
		player._socket?.to(game.roomName).emit("game:played:card:others", toPlayedCardDto(player._name, playedCard, cardIndex));

		switch (dto.cardCode) {
			case CardCode.Reverse:
				this.playReverseCard(game, playedCard)
				break;
			case CardCode.Skip:
				this.playSkipCard(game, playedCard);
				break;
			case CardCode.DrawTwo:
				this.playDrawTwoCard(playerId, game, playedCard);
				break;
			case CardCode.Wild:
				this.playWildCard(game, playedCard, player);
				break;
			case CardCode.WildDrawFour:
				this.playWildDrawFourCard(game, playedCard, player);
				break;

			default:
				this.playValueCard(game, playedCard);
				break;
		}

		return true;
	}

	// =================================
	// ======= BUTTON UNO EFFECT =======
	// =================================

	shoutUno(playerId: string): boolean
	{
		// TODO: Do the function.

		return true;
	}

	// ================================
	// ======= DECK DRAW EFFECT =======
	// ================================

	drawCard(playerId: string, game: Game, iterNbr: number): boolean
	{
		// TODO: Do the function.
		const player = this.gameRepository.getPlayerInGame(game, playerId);
		if (!player)
		{
			console.log(`Player ${playerId} is not in the game ${game.roomName}`); // TODO: Replace this console log
			return false;
		}

		if (!this.gameLogicService.isPlayersTurn(game, player))
		{
			console.log(`It's not player ${playerId}'s turn is not in the game ${game.roomName}`); // TODO: Replace this console log
			return false;
		}

		if (game.deck.length === 0)
		{
			this.deckService.discardToDeck(game);
			this.getIoServer()?.to(game.roomName).emit("game:deck:discard")
			this.getIoServer()?.to(game.roomName).emit("game:deck:shuffled")
		}

		for (let i = 0; i < iterNbr; i++) {
			const card = game.deck.pop();
			if (!card)
			{
				console.log(`Game ${game.roomName} has nore more card available in the deck.`);
				return false;
			}
	
			player._hand.push(card);
			player.hasDrawThisTurn = true;
	
			player._socket?.emit("game:draw:self", toDrewCardDto(player._name, card));
			player._socket?.to(game.roomName).emit("game:draw:others", toDrewCardDto(player._name, undefined));
		}

		return true;
	}
}
