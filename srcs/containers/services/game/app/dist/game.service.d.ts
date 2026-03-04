import { CreateGameDto } from "./dto/create-game.dto";
import { Game } from "./domain/UnoGame";
import { Server, Socket } from "socket.io";
import { DeckService } from "./deck.service";
import { GameLogicService } from "./game-logic.service";
import { GameRepositoryService } from "./game-repository";
import { GamePlayService } from "./game-play.service";
import { CardDto } from "./dto/card.dto";
import { BotLogicService } from "./bot-logic.service";
export declare class GameService {
    private readonly gameRepository;
    private readonly gameLogic;
    private readonly deckService;
    private readonly gamePlay;
    private readonly botLogic;
    private io?;
    private readonly gameInitReadyByRoom;
    constructor(gameRepository: GameRepositoryService, gameLogic: GameLogicService, deckService: DeckService, gamePlay: GamePlayService, botLogic: BotLogicService);
    setServer(io: Server): void;
    getServer(): Server | undefined;
    create(dto: CreateGameDto): Game;
    join(playerId: string, socket: Socket): void;
    onPlayerInitReady(playerId: string): void;
    private emitGameInit;
    leave(playerId: string, socket: Socket): void;
    playCard(playerId: string, dto: CardDto): Promise<void>;
    drawCard(playerId: string): void;
    shoutUno(playerId: string): void;
}
