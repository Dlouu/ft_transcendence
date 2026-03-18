import { Injectable } from "@nestjs/common";
import { Game } from "./domain/UnoGame";

@Injectable()
export class GameDebugService
{
	/**
	 * Prints the current deck order to the console for debugging.
	 * @param game The current game instance containing the deck.
	 * @returns void
	 */
  printDeck(game: Game): void {
	console.log("Deck:");
	game.deck.forEach((c, i) => {
	  console.log(`${i}: ${c.family} ${c.value}`);
	});
  }

	/**
	 * Prints each player's hand to the console for debugging.
	 * @param game The current game instance containing the players and their hands.
	 * @returns void
	 */
  printHands(game: Game): void {
	console.log("Players' Hands:");
	for (const p of game.players) {
	  console.log(`${p._name}:`);
	  p._hand.forEach((c, i) => {
		console.log(`  ${i}: ${c.family} ${c.value}`);
	  });
	}
  }
}
