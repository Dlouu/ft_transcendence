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
exports.GamePlayService = void 0;
const game_logic_service_1 = require("./game-logic.service");
const common_1 = require("@nestjs/common");
const deck_service_1 = require("./deck.service");
const game_repository_1 = require("./game-repository");
let GamePlayService = class GamePlayService {
    deckService;
    gameRepository;
    gameLogicService;
    constructor(deckService, gameRepository, gameLogicService) {
        this.deckService = deckService;
        this.gameRepository = gameRepository;
        this.gameLogicService = gameLogicService;
    }
    playCard(playerName) {
    }
    shoutUno(playerName) {
    }
    drawCard(gameId, playerName) {
    }
};
exports.GamePlayService = GamePlayService;
exports.GamePlayService = GamePlayService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [deck_service_1.DeckService,
        game_repository_1.GameRepositoryService,
        game_logic_service_1.GameLogicService])
], GamePlayService);
//# sourceMappingURL=game-play.service.js.map