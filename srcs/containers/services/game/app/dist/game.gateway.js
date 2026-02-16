"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const game_service_1 = require("./game.service");
const socket_io_1 = require("socket.io");
const UnoGame_1 = require("./domain/UnoGame");
let GameGateway = class GameGateway {
    gameService;
    server;
    constructor(gameService) {
        this.gameService = gameService;
    }
    afterInit(server) {
        this.gameService.setServer(server);
    }
    handleConnection(client) {
        try {
            const rawPlayerId = client.handshake.query.playerId;
            if (!rawPlayerId || Array.isArray(rawPlayerId)) {
                throw new Error("Connection rejected: Missing or invalid playerId.");
            }
            const playerId = rawPlayerId;
            client.data.playerId = playerId;
            const game = this.gameService.findGameByPlayer(client.data.playerId);
            if (game) {
                console.log(`Player ${client.data.playerId} is connected`);
                client.join(game.roomName);
                this.gameService.join(client.data.playerId, game, client);
                client.emit("game:join", {
                    game: game.toJson(),
                });
                client.to(game.roomName).emit("playerJoined", { playerName: client.data.playerId });
                this.gameService.tryStart(game);
            }
            else {
                throw new Error("Player's not in a game.");
            }
        }
        catch (error) {
            console.error("Error during connection handshake:", error);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const playerName = client.data.playerId;
        console.log("Client " + playerName + " disconnected");
        const game = this.gameService.leave(playerName);
        if (game) {
            const wasConnected = game.connectedPlayers.delete(playerName);
            if (wasConnected) {
                console.log(`Player ${playerName} removed from connectedPlayers in ${game.roomName}`);
            }
            else {
                console.log(`Player ${playerName} was not in connectedPlayers for ${game.roomName}`);
            }
            client.to(game.roomName).emit("playerLeft", { playerName });
            if (game.connectedPlayers.size === 0 && game.state != UnoGame_1.GameState.WAITING_FOR_PLAYERS) {
                console.log(`No connected players left in ${game.roomName}. Deleting game.`);
                this.gameService.deleteGame(game);
            }
        }
    }
};
exports.GameGateway = GameGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GameGateway.prototype, "server", void 0);
exports.GameGateway = GameGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: "*" } }),
    __metadata("design:paramtypes", [game_service_1.GameService])
], GameGateway);
//# sourceMappingURL=game.gateway.js.map