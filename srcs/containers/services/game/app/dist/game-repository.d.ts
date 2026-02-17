import { Socket } from "socket.io";
import { Game } from "./domain/UnoGame";
import { UnoPlayer } from "./domain/UnoPlayer";
import { CreateGameDto } from "./dto/create-game.dto";
export declare class GameRepositoryService {
    private games;
    create(createGameDto: CreateGameDto): Game;
    deleteGame(game: Game): void;
    join(game: Game, playerId: string, socket: Socket): void;
    rejoin(player: UnoPlayer, game: Game): void;
    leave(game: Game, playerId: string, socket: Socket): void;
    getPlayerInGame(game: Game, playerId: string): UnoPlayer | undefined;
    getGameByPlayer(playerId: string): Game | undefined;
    getGameByName(room: string): Game | undefined;
}
