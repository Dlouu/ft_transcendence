import { CreateGameDto } from "./dto/create-game.dto";
import { GameService } from "./game.service";
export declare class GameController {
    private readonly gameService;
    constructor(gameService: GameService);
    createGame(dto: CreateGameDto): Record<string, unknown>;
}
