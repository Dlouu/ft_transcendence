import { Game } from "./domain/UnoGame";
import { CardFamily } from "./domain/GameEnums";
import { DeckService } from "./deck.service";
import { GameRepositoryService } from "./game-repository";
import { UnoPlayer } from "./domain/UnoPlayer";
import { CardDto } from "./dto/card.dto";
import { Card } from "./domain/UnoCard";
export declare class GameLogicService {
    private readonly deckService;
    private readonly gameRepository;
    private colorPickCallbacks;
    private readonly unoRevealDelayMs;
    constructor(deckService: DeckService, gameRepository: GameRepositoryService);
    tryStart(game: Game): boolean;
    startGame(game: Game): boolean;
    randomizePlayerOrder(game: Game): void;
    doesPlayerHaveCard(cardDto: CardDto, player: UnoPlayer): number;
    isPlayersTurn(game: Game, player: UnoPlayer): boolean;
    isPlayable(topCard: Card | undefined, playingCard: CardDto): boolean;
    reverseTurnOrder(game: Game): void;
    goToNextPlayerIndex(game: Game): void;
    getNextPlayer(game: Game): UnoPlayer;
    private randomCardFamily;
    private formatDurationToDdHhMmSs;
    askPlayerColor(game: Game, player: UnoPlayer): Promise<CardFamily>;
    onColorPicked(playerId: string, color: CardFamily): void;
    onUno(game: Game, player: UnoPlayer): void;
    onVictory(game: Game, winner: UnoPlayer): void;
}
