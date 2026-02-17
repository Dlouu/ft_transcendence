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
let GameService = class GameService {
    gameRepository;
    gameLogic;
    deckService;
    gamePlay;
    io;
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
        const game = this.gameRepository.getGameByPlayer(playerId);
        if (!game)
            throw new Error("Player's not in a game.");
        this.gameRepository.join(game, playerId, socket);
        this.gameLogic.tryStart(game);
    }
    leave(playerId, socket) {
        const game = this.gameRepository.getGameByPlayer(playerId);
        if (!game)
            throw new Error("Player's not in a game.");
        this.gameRepository.leave(game, playerId, socket);
        if (game.connectedPlayers.size === 0 &&
            game.state != UnoGame_1.GameState.WAITING_FOR_PLAYERS) {
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