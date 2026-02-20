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
const UnoPlayer_1 = require("./domain/UnoPlayer");
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
    join(playerId, socket) {
        const game = this.getGameByExpectedPlayer(playerId);
        if (!game)
            throw new Error("Player's not in a game.");
        if (!game.expectedPlayers.includes(playerId)) {
            throw new common_1.ConflictException("Player is not expected in this game");
        }
        let player = this.getPlayerInGame(game, playerId);
        const isFirstJoin = !player;
        if (!player) {
            const newPlayer = new UnoPlayer_1.UnoPlayer(playerId, playerId, socket, false);
            const hasJoined = game.addPlayer(newPlayer);
            if (!hasJoined) {
                throw new common_1.ConflictException("Unable to join game: game is full");
            }
            player = newPlayer;
        }
        else {
            player._socket = socket;
        }
        socket.join(game.roomName);
        if (game.state === UnoGame_1.GameState.PLAYING ||
            game.state === UnoGame_1.GameState.AWAITING_COLOR_CHOICE) {
            this.rejoin(player, game);
            return game;
        }
        socket.emit("game:join", {
            game: game.toJson(),
        });
        if (isFirstJoin) {
            socket
                .to(game.roomName)
                .emit("game:playerJoined", { playerName: player._name });
        }
        game.connectedPlayers.add(playerId);
        return game;
    }
    rejoin(player, game) {
        if (!player)
            return;
        game.connectedPlayers.add(player._id);
    }
    leave(playerId, socket) {
        const game = this.getGameByConnectedPlayer(playerId);
        if (!game)
            throw new Error("Player's not in a game.");
        game.connectedPlayers.delete(playerId);
        socket.to(game.roomName).emit("game:playerLeft", { playerId });
        return game;
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
    getGameByExpectedPlayer(playerId) {
        return this.games.find((g) => g.expectedPlayers.includes(playerId));
    }
    getGameByConnectedPlayer(playerId) {
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