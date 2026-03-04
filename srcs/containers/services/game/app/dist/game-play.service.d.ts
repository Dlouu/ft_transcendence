import { GameLogicService } from './game-logic.service';
import { DeckService } from "./deck.service";
import { CardDto } from './dto/card.dto';
import { Game } from './domain/UnoGame';
import { Card } from './domain/UnoCard';
import { UnoPlayer } from './domain/UnoPlayer';
import { GameService } from './game.service';
import { GameRepositoryService } from './game-repository';
export declare class GamePlayService {
    private readonly deckService;
    private readonly gameLogicService;
    private readonly gameRepository;
    private readonly gameService;
    constructor(deckService: DeckService, gameLogicService: GameLogicService, gameRepository: GameRepositoryService, gameService: GameService);
    private getIoServer;
    playValueCard(game: Game, playedCard: Card): boolean;
    playSkipCard(game: Game, playedCard: Card): boolean;
    playReverseCard(game: Game, playedCard: Card): boolean;
    playDrawTwoCard(game: Game, playedCard: Card): boolean;
    playWildCard(game: Game, playedCard: Card, player: UnoPlayer): Promise<boolean>;
    playWildDrawFourCard(game: Game, playedCard: Card, player: UnoPlayer): Promise<boolean>;
    playCard(game: Game, dto: CardDto, player: UnoPlayer): Promise<boolean>;
    shoutUno(game: Game, player: UnoPlayer): boolean;
    drawCard(game: Game, iterNbr: number, isDrawCard: boolean, player: UnoPlayer): boolean;
}
