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
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const GameEnums_1 = require("./domain/GameEnums");
const deck_service_1 = require("./deck.service");
const game_logic_service_1 = require("./game-logic.service");
const game_repository_1 = require("./game-repository");
const game_play_service_1 = require("./game-play.service");
const init_game_dto_1 = require("./dto/init-game.dto");
const bot_logic_service_1 = require("./bot-logic.service");
let GameService = class GameService {
    gameRepository;
    gameLogic;
    deckService;
    gamePlay;
    botLogic;
    io;
    gameInitReadyByRoom = new Map();
    constructor(gameRepository, gameLogic, deckService, gamePlay, botLogic) {
        this.gameRepository = gameRepository;
        this.gameLogic = gameLogic;
        this.deckService = deckService;
        this.gamePlay = gamePlay;
        this.botLogic = botLogic;
    }
    setServer(io) {
        this.io = io;
    }
    getServer() {
        return this.io;
    }
    create(dto) {
        return this.gameRepository.create(dto);
    }
    join(playerId, socket) {
        const game = this.gameRepository.join(playerId, socket);
        const started = this.gameLogic.tryStart(game);
        if (!started || !this.io || game.discard.length === 0) {
            return;
        }
        this.emitGameInit(game);
    }
    onPlayerInitReady(playerId) {
        if (!this.io) {
            return;
        }
        const game = this.gameRepository.getGameByConnectedPlayer(playerId);
        if (!game || game.state !== GameEnums_1.GameState.PLAYING) {
            return;
        }
        if (!game.expectedPlayers.includes(playerId)) {
            return;
        }
        const roomReadyPlayers = this.gameInitReadyByRoom.get(game.roomName);
        if (!roomReadyPlayers) {
            return;
        }
        roomReadyPlayers.add(playerId);
        if (roomReadyPlayers.size < game.expectedPlayers.length) {
            return;
        }
        game.createdAt = Date.now();
        this.io.to(game.roomName).emit("game:start");
        this.gameInitReadyByRoom.delete(game.roomName);
    }
    emitGameInit(game) {
        this.gameInitReadyByRoom.set(game.roomName, new Set());
        const topDiscard = game.discard.peek();
        if (!topDiscard) {
            return;
        }
        const players = game.players.map((player) => ({
            name: player._name,
            cardBack: player._cardBack,
        }));
        game.players.forEach((player, index) => {
            const initGameDto = {
                players,
                discardTopCard: {
                    cardCode: topDiscard.value,
                    cardFamily: topDiscard.family,
                },
                firstPlayerIndex: game.currentPlayerIndex,
                turnDirection: game.currentDirection,
                startCardNbr: 7,
                playerIndex: index,
                playerHand: (0, init_game_dto_1.toCardDtoArray)(player._hand),
                cardTheme: game.cardTheme,
            };
            if (player._socket) {
                player._socket.emit("game:init", initGameDto);
            }
        });
    }
    leave(playerId, socket) {
        if (typeof playerId !== "string" || playerId.trim() === "") {
            return;
        }
        const game = this.gameRepository.getGameByConnectedPlayer(playerId);
        if (!game) {
            return;
        }
        this.gameRepository.leave(playerId, socket);
        if (game && game.connectedPlayers.size === 0) {
            this.gameInitReadyByRoom.delete(game.roomName);
            console.log(`No connected players left in ${game.roomName}. Deleting game.`);
            this.gameRepository.deleteGame(game);
        }
    }
    async playCard(playerId, dto) {
        const game = this.gameRepository.getGameByConnectedPlayer(playerId);
        if (!game || game.state !== GameEnums_1.GameState.PLAYING) {
            return;
        }
        const player = this.gameRepository.getPlayerInGame(game, playerId);
        if (!player) {
            return;
        }
        if (game.pendingUnoPlayerIndex !== null) {
            return;
        }
        if (!await this.gamePlay.playCard(game, dto, player))
            return;
        if (player._hand.length === 0) {
            this.gameLogic.onVictory(game, player);
            return;
        }
        if (player._hand.length === 1) {
            this.gameLogic.onUno(game, player);
        }
        this.gameLogic.goToNextPlayerIndex(game);
        const now = Date.now();
        game.lastActionTime = now;
        game.turnStartTime = now;
        const nextTurnDto = {
            currentPlayerIndex: game.currentPlayerIndex,
            turnDirection: game.currentDirection,
        };
        this.io?.to(game.roomName).emit("game:nextTurn", nextTurnDto);
    }
    drawCard(playerId) {
        const game = this.gameRepository.getGameByConnectedPlayer(playerId);
        if (!game || game.state !== GameEnums_1.GameState.PLAYING) {
            return;
        }
        const player = this.gameRepository.getPlayerInGame(game, playerId);
        if (!player) {
            return;
        }
        if (game.pendingUnoPlayerIndex !== null) {
            return;
        }
        if (!this.gamePlay.drawCard(game, 1, false, player))
            return;
        this.gameLogic.goToNextPlayerIndex(game);
        const now = Date.now();
        game.lastActionTime = now;
        game.turnStartTime = now;
        const nextTurnDto = {
            currentPlayerIndex: game.currentPlayerIndex,
            turnDirection: game.currentDirection,
        };
        this.io?.to(game.roomName).emit("game:nextTurn", nextTurnDto);
    }
    shoutUno(playerId) {
        const game = this.gameRepository.getGameByConnectedPlayer(playerId);
        if (!game || game.state !== GameEnums_1.GameState.PLAYING) {
            return;
        }
        const player = this.gameRepository.getPlayerInGame(game, playerId);
        if (!player) {
            return;
        }
        this.gamePlay.shoutUno(game, player);
    }
};
exports.GameService = GameService;
exports.GameService = GameService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => game_play_service_1.GamePlayService))),
    __metadata("design:paramtypes", [game_repository_1.GameRepositoryService,
        game_logic_service_1.GameLogicService,
        deck_service_1.DeckService,
        game_play_service_1.GamePlayService,
        bot_logic_service_1.BotLogicService])
], GameService);
//# sourceMappingURL=game.service.js.map