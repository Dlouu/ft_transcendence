import { Card } from "./domain/UnoCard";
import { Game } from "./domain/UnoGame";
export declare class DeckService {
    createDeck(): Card[];
    discardToDeck(game: Game): void;
    shuffleDeck(deck: Card[]): Card[];
    startDeal(game: Game): void;
}
