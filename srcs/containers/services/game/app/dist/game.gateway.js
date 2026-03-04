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
const game_logic_service_1 = require("./game-logic.service");
const socket_io_1 = require("socket.io");
const placeholder_event_dto_1 = require("./dto/placeholder-event.dto");
const card_dto_1 = require("./dto/card.dto");
let GameGateway = class GameGateway {
    gameService;
    gameLogic;
    constructor(gameService, gameLogic) {
        this.gameService = gameService;
        this.gameLogic = gameLogic;
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
    async handlePlayCard(payload, socket) {
        const playerId = socket.data.playerId;
        if (typeof playerId !== "string" || playerId.trim() === "") {
            return;
        }
        await this.gameService.playCard(playerId, payload);
        console.log(`Player ${playerId} play the card ${payload.cardCode} ${payload.cardFamily}`);
    }
    handleDraw(socket) {
        const playerId = socket.data.playerId;
        if (typeof playerId !== "string" || playerId.trim() === "") {
            return;
        }
        this.gameService.drawCard(playerId);
    }
    handleShoutUno(socket) {
        const playerId = socket.data.playerId;
        if (typeof playerId !== "string" || playerId.trim() === "") {
            return;
        }
        this.gameService.shoutUno(playerId);
    }
    handleWildColorPicked(payload, socket) {
        const playerId = socket.data.playerId;
        if (typeof playerId !== "string" || playerId.trim() === "") {
            return;
        }
        this.gameLogic.onColorPicked(playerId, payload.cardFamily);
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
    (0, websockets_1.SubscribeMessage)("game:play:card"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [card_dto_1.CardDto,
        socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handlePlayCard", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("game:play:draw"),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handleDraw", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("game:play:uno"),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handleShoutUno", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("game:wild:color-picked"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handleWildColorPicked", null);
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
    __metadata("design:paramtypes", [game_service_1.GameService,
        game_logic_service_1.GameLogicService])
], GameGateway);
//# sourceMappingURL=game.gateway.js.map