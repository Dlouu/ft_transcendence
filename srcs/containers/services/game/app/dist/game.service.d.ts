import { CreateGameDto } from "./dto/create-game.dto";
import { Game } from "./domain/UnoGame";
import { Server, Socket } from "socket.io";
import { DeckService } from "./deck.service";
import { GameLogicService } from "./game-logic.service";
import { GameRepositoryService } from "./game-repository";
import { GamePlayService } from "./game-play.service";
export declare class GameService {
    private readonly gameRepository;
    private readonly gameLogic;
    private readonly deckService;
    private readonly gamePlay;
    private io?;
    constructor(gameRepository: GameRepositoryService, gameLogic: GameLogicService, deckService: DeckService, gamePlay: GamePlayService);
    setServer(io: Server): void;
    create(dto: CreateGameDto): Game;
    join(playerId: string, socket: Socket): void;
    leave(playerId: string, socket: Socket): void;
}
