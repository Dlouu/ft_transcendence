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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const game_service_1 = require("./game.service");
const socket_io_1 = require("socket.io");
const placeholder_event_dto_1 = require("./dto/placeholder-event.dto");
let GameGateway = class GameGateway {
    gameService;
    constructor(gameService) {
        this.gameService = gameService;
    }
    afterInit(server) {
        this.gameService.setServer(server);
    }
    handleConnection(socket) {
        try {
            const playerId = socket.handshake.query.playerId;
            if (typeof playerId !== "string" || playerId.trim() === "") {
                throw new Error("Connection rejected: Missing or invalid playerId.");
            }
            socket.data.playerId = playerId;
            this.gameService.join(playerId, socket);
        }
        catch (error) {
            console.error("Error during connection:", error);
            socket.disconnect();
        }
    }
    handleDisconnect(socket) {
        this.gameService.leave(socket.data.playerId, socket);
    }
    handleGameInitReady(socket) {
        const playerId = socket.data.playerId;
        if (typeof playerId !== "string" || playerId.trim() === "") {
            return;
        }
        this.gameService.onPlayerInitReady(playerId);
    }
    handlePlaceholderEvent(payload, acknowledgement) {
        console.log("placeholder event go !");
        acknowledgement({
            ok: true,
            event: "placeholder:event",
            payload,
        });
    }
};
exports.GameGateway = GameGateway;
__decorate([
    (0, websockets_1.SubscribeMessage)("game:init:ready"),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handleGameInitReady", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("placeholder:event"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.Ack)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [placeholder_event_dto_1.PlaceholderEventDto, Function]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handlePlaceholderEvent", null);
exports.GameGateway = GameGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: "*" } }),
    __metadata("design:paramtypes", [game_service_1.GameService])
], GameGateway);
//# sourceMappingURL=game.gateway.js.map