import { Socket } from "socket.io";
import { Game } from "./domain/UnoGame";
import { UnoPlayer } from "./domain/UnoPlayer";
import { CreateGameDto } from "./dto/create-game.dto";
export declare class GameRepositoryService {
    private games;
    create(createGameDto: CreateGameDto): Game;
    deleteGame(game: Game): void;
    join(playerId: string, socket: Socket): Game;
    rejoin(player: UnoPlayer, game: Game): void;
    leave(playerId: string, socket: Socket): Game;
    getPlayerInGame(game: Game, playerId: string): UnoPlayer | undefined;
    getGameByExpectedPlayer(playerId: string): Game | undefined;
    getGameByConnectedPlayer(playerId: string): Game | undefined;
    getGameByName(room: string): Game | undefined;
}
