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
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const UnoGame_1 = require("./domain/UnoGame");
const deck_service_1 = require("./deck.service");
const game_logic_service_1 = require("./game-logic.service");
const game_repository_1 = require("./game-repository");
const game_play_service_1 = require("./game-play.service");
const init_game_dto_1 = require("./dto/init-game.dto");
let GameService = class GameService {
    gameRepository;
    gameLogic;
    deckService;
    gamePlay;
    io;
    gameInitReadyByRoom = new Map();
    constructor(gameRepository, gameLogic, deckService, gamePlay) {
        this.gameRepository = gameRepository;
        this.gameLogic = gameLogic;
        this.deckService = deckService;
        this.gamePlay = gamePlay;
    }
    setServer(io) {
        this.io = io;
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
        if (!game || game.state !== UnoGame_1.GameState.PLAYING) {
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
        this.io.to(game.roomName).emit("game:start");
        this.gameInitReadyByRoom.delete(game.roomName);
    }
    emitGameInit(game) {
        this.gameInitReadyByRoom.set(game.roomName, new Set());
        const topDiscard = game.discard[game.discard.length - 1];
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
                cardTheme: "basic",
            };
            if (player._socket) {
                player._socket.emit("game:init", initGameDto);
            }
        });
    }
    leave(playerId, socket) {
        const game = this.gameRepository.leave(playerId, socket);
        if (game &&
            game.connectedPlayers.size === 0 &&
            game.state != UnoGame_1.GameState.WAITING_FOR_PLAYERS) {
            this.gameInitReadyByRoom.delete(game.roomName);
            console.log(`No connected players left in ${game.roomName}. Deleting game.`);
            this.gameRepository.deleteGame(game);
        }
    }
};
exports.GameService = GameService;
exports.GameService = GameService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [game_repository_1.GameRepositoryService,
        game_logic_service_1.GameLogicService,
        deck_service_1.DeckService,
        game_play_service_1.GamePlayService])
], GameService);
//# sourceMappingURL=game.service.js.map