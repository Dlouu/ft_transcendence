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
let GameGateway = class GameGateway {
    gameService;
    constructor(gameService) {
        this.gameService = gameService;
    }
    handleConnection(client) {
        try {
            const rawPlayerId = client.handshake.query.playerId;
            if (!rawPlayerId || Array.isArray(rawPlayerId)) {
                throw new Error("Connection rejected: Missing or invalid playerId.");
            }
            const playerId = rawPlayerId;
            console.log(`Player ${playerId}'s trying connection`);
            client.data.playerId = playerId;
            const test = this.gameService.join(client.data.playerId);
            if (test) {
                console.log("Client id : " + client.data.playerId);
                void client.join(test.roomName);
                client.emit("TestJoin", {
                    test: {
                        ...test,
                        connectedPlayers: [...test.connectedPlayers],
                    },
                });
                client.to(test.roomName).emit("playerJoined", { playerName: client.data.playerId });
                console.log(`Player ${client.data.playerId} is connected`);
            }
            else {
                console.log(`Player ${client.data.playerId} is not in a game`);
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
            client.to(game.roomName).emit("playerLeft", { playerName });
        }
    }
};
exports.GameGateway = GameGateway;
exports.GameGateway = GameGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: "*" } }),
    __metadata("design:paramtypes", [game_service_1.GameService])
], GameGateway);
//# sourceMappingURL=game.gateway.js.map