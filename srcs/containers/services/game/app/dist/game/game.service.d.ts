import { PlayCardDto } from './dto/play-card.dto';
import { CreateGameDto } from "./dto/create-game.dto";
import { game } from "./domain/game";
import { card } from "./domain/card";
export declare class GameService {
    private games;
    join(playerName: string): game | null;
    leave(playerName: string): game | null;
    private findGameByPlayer;
    create(createGameDto: CreateGameDto): game;
    getGameByName(name: string): game | undefined;
    randomizePlayerOrder(game: game): void;
    createDeck(): card[];
    shuffleDeck(deck: card[]): card[];
    discardToDeck(game: game): void;
    printDeck(game: game): void;
    printHands(game: game): void;
    startDeal(game: game): void;
    shoutUno(playerName: string): void;
    passTurn(gameId: string, playerName: string): void;
    drawCard(gameId: string, playerName: string): void;
    playCard(playerName: string, playCardDto: PlayCardDto): void;
    private drawCardsToPlayer;
    private doesPlayerHaveCard;
    private isPlayersTurn;
    private reverseTurnOrder;
    private goToNextPlayerIndex;
}
