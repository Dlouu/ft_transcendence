import { Game } from "./domain/UnoGame";
import { DeckService } from "./deck.service";
import { GameRepositoryService } from "./game-repository";
import { UnoPlayer } from "./domain/UnoPlayer";
import { CardDto } from "./dto/play-card.dto";
export declare class GameLogicService {
    private readonly deckService;
    private readonly gameRepository;
    constructor(deckService: DeckService, gameRepository: GameRepositoryService);
    tryStart(game: Game): boolean;
    startGame(game: Game): boolean;
    randomizePlayerOrder(game: Game): void;
    doesPlayerHaveCard(cardDto: CardDto, player: UnoPlayer): boolean;
    isPlayersTurn(game: Game, playerName: string): boolean;
    reverseTurnOrder(game: Game): void;
    goToNextPlayerIndex(game: Game): void;
}
