import { GameLogicService } from './game-logic.service';
import { Injectable } from "@nestjs/common";
import { DeckService } from "./deck.service";
import { GameRepositoryService } from "./game-repository";

// Handles the inputsof the players of the game (play card, draw, uno).
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

	playCard(playerName: string) {
		// TODO: Redo this ENTIRE function, you dumbfuck asshole !
	}

	// =================================
	// ======= BUTTON UNO EFFECT =======
	// =================================

	shoutUno(playerName: string)
	{
		// TODO: Check if need to redo the function.
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

	drawCard(gameId: string, playerName: string)
	{
		// TODO: Check if need to redo the function.
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
