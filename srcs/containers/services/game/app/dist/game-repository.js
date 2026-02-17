"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRepositoryService = void 0;
const common_1 = require("@nestjs/common");
const UnoGame_1 = require("./domain/UnoGame");
let GameRepositoryService = class GameRepositoryService {
    games = [];
    create(createGameDto) {
        const { roomName, players, botNbr } = createGameDto;
        if (this.getGameByName(roomName)) {
            throw new common_1.ConflictException("Game name already exists");
        }
        const newGame = new UnoGame_1.Game(roomName, players, players.length, botNbr);
        newGame.state = UnoGame_1.GameState.WAITING_FOR_PLAYERS;
        this.games.push(newGame);
        console.log("Game " + newGame.roomName + " has been created !");
        return newGame;
    }
    deleteGame(game) {
        this.games = this.games.filter((existingGame) => existingGame !== game);
    }
    join(game, playerId, socket) {
        const player = game.players.find((p) => p._name === playerId);
        if (!player)
            return;
        else
            player._socket = socket;
        socket.join(game.roomName);
        if (game.state === UnoGame_1.GameState.PLAYING ||
            game.state === UnoGame_1.GameState.AWAITING_COLOR_CHOICE) {
            this.rejoin(player, game);
            return;
        }
        socket.emit("game:join", {
            game: game.toJson(),
        });
        socket
            .to(game.roomName)
            .emit("game:playerJoined", { playerName: player._name });
        game.connectedPlayers.add(playerId);
    }
    rejoin(player, game) {
        if (!player)
            return;
        game.connectedPlayers.add(player._id);
    }
    leave(game, playerId, socket) {
        game.connectedPlayers.delete(playerId);
        socket.to(game.roomName).emit("game:playerLeft", { playerId });
    }
    getPlayerInGame(game, playerId) {
        if (!game) {
            return undefined;
        }
        const player = game.players.find((p) => p._name === playerId);
        if (!player) {
            return undefined;
        }
        return player;
    }
    getGameByPlayer(playerId) {
        return this.games.find((g) => g.players.some((p) => p._name === playerId));
    }
    getGameByName(room) {
        return this.games.find((g) => g.roomName === room);
    }
};
exports.GameRepositoryService = GameRepositoryService;
exports.GameRepositoryService = GameRepositoryService = __decorate([
    (0, common_1.Injectable)()
], GameRepositoryService);
//# sourceMappingURL=game-repository.js.map