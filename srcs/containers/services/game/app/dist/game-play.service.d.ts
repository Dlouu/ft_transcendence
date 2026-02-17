import { GameLogicService } from './game-logic.service';
import { DeckService } from "./deck.service";
import { GameRepositoryService } from "./game-repository";
export declare class GamePlayService {
    private readonly deckService;
    private readonly gameRepository;
    private readonly gameLogicService;
    constructor(deckService: DeckService, gameRepository: GameRepositoryService, gameLogicService: GameLogicService);
    playCard(playerName: string): void;
    shoutUno(playerName: string): void;
    drawCard(gameId: string, playerName: string): void;
}
