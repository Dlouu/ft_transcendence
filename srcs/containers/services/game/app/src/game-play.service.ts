import { GameLogicService } from './game-logic.service';
import { Injectable } from "@nestjs/common";
import { DeckService } from "./deck.service";
import { GameRepositoryService } from "./game-repository";
import { CardDto } from './dto/card.dto';
import { Game } from './domain/UnoGame';
import { CardCode, CardFamily } from './domain/GameEnums';
import { UnoPlayer } from './domain/UnoPlayer';
import { toPlayedCardDto } from './dto/played-card.dto';

// Handles the inputs of the players of the game (play card, draw, uno).
@Injectable()
export class GamePlayService {
	constructor(
		private readonly deckService: DeckService,
		private readonly gameRepository: GameRepositoryService,
		private readonly gameLogicService: GameLogicService,
	) {}

	// ============================
	// ======= CARD PLAYING =======
	// ============================

	playValueCard(player: UnoPlayer, game: Game, dto: CardDto, cardIndex: number): boolean {
		const [playedCard] = player._hand.splice(cardIndex, 1);
		if (!playedCard) {
			return false;
		}

		game.discard.push(playedCard);
		game.currentFamily = playedCard.family;

		player._socket?.emit("game:played:card:self", toPlayedCardDto(player, cardIndex));
		player._socket?.to(game.roomName).emit("game:played:card:others", toPlayedCardDto(player, cardIndex));

		return true;
	}

	playSkipCard(player: UnoPlayer, game: Game, dto: CardDto, cardIndex: number): boolean {
		return true;
	}

	playReverseCard(player: UnoPlayer, game: Game, dto: CardDto, cardIndex: number): boolean {
		return true;
	}

	playPlusTwoCard(player: UnoPlayer, game: Game, dto: CardDto, cardIndex: number): boolean {
		return true;
	}

	playWildCard(player: UnoPlayer, game: Game, dto: CardDto, cardIndex: number): boolean {
		return true;
	}

	playWildPlusFourCard(player: UnoPlayer, game: Game, dto: CardDto, cardIndex: number): boolean {
		return true;
	}

	playCard(playerId: string, game: Game, dto: CardDto): boolean {
		// TODO: Redo this ENTIRE function, you dumbfuck asshole !
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

		const topCard = game.discard.peek();
		if (!this.gameLogicService.isPlayable(topCard, dto))
		{
			console.log(`Player ${playerId}'s card is not playable in the game ${game.roomName}`); // TODO: Replace this console log
			return false;
		}

		switch (dto.cardCode) {
			// case CardCode.Reverse:
				
			// 	break;
			// case CardCode.Skip:
				
			// 	break;
			// case CardCode.DrawTwo:
				
			// 	break;
			// case CardCode.Wild:
				
			// 	break;
			// case CardCode.WildDrawFour:
				
			// 	break;

			default:
				this.playValueCard(player, game, dto, cardIndex);
				break;
		}

		return true;
	}

	// =================================
	// ======= BUTTON UNO EFFECT =======
	// =================================

	shoutUno(playerName: string): boolean
	{
		// TODO: Check if need to redo the function.

		return true;
	}

	/* shoutUno(playerName: string) {
		const game = this.gameRepository.findGameByPlayer(playerName);
		if (!game || game.pendingUnoPlayerIndex === null) {
			return;
		}

		const elapsed = Date.now() - game.lastActionTime;

		const SHOUTING_SECONDS = 3; // In seconds
		const ADVANTAGE_SECONDS = 0.5; // In seconds

		const UNO_WINDOW = SHOUTING_SECONDS * 1000; // In miliseconds
		const ADVANTAGE_WINDOW = ADVANTAGE_SECONDS * 1000; // In miliseconds

		if (elapsed > UNO_WINDOW) {
			return;
		}

		const pendingPlayer = game.players[game.pendingUnoPlayerIndex];
		if (!pendingPlayer) return;

		// Uno shout
		if (pendingPlayer._name === playerName) {
			if (!game.unoShouted) {
				game.unoShouted = true;
				// PLACEHOLDER: Room emit "playerShoutedUno" { player: playerName }
			}
		}
		// Counter uno shout
		else {
			if (elapsed < ADVANTAGE_WINDOW) {
				return;
			}

			if (!game.unoShouted) {
				for (let i = 0; i < 2; i++) {
					if (game.deck.length === 0) {
						this.deckService.discardToDeck(game);
					}
					const c = game.deck.pop();
					if (c) pendingPlayer._hand.push(c);
				}

				game.pendingUnoPlayerIndex = null;
				game.unoShouted = false;

				// PLACEHOLDER: Room emit "counterUnoSuccessful" { target: pendingPlayer._name, challenger: playerName }
			}
		}
	} */

	// ================================
	// ======= DECK DRAW EFFECT =======
	// ================================

	drawCard(playerId: string, game: Game): boolean
	{
		// TODO: Check if need to redo the function.

		return true;
	}

	/* drawCard(gameId: string, playerName: string) {
		const game = this.gameRepository.getGameByName(gameId);
		if (!game) {
			throw new Error("Game not found");
		}

		if (!this.gameLogicService.isPlayersTurn(game, playerName)) {
			throw new Error("Not your turn");
		}

		if (game.hasDrawnThisTurn) {
			throw new Error("You have already drawn a card this turn");
		}

		if (game.deck.length === 0) {
			this.deckService.discardToDeck(game);
		}

		if (game.deck.length === 0) {
			return;
		}

		const card = game.deck.pop();
		const player = game.players.find((p) => p._name === playerName);
		if (player && card) {
			player._hand.push(card);
			game.hasDrawnThisTurn = true;

			// PLACEHOLDER: Player emit "cardDrawn" { card: ... }
			// PLACEHOLDER: Player to Room emit "opponentDrawn"
		}
	} */
}
