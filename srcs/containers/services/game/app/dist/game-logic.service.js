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
exports.GameLogicService = void 0;
const common_1 = require("@nestjs/common");
const UnoGame_1 = require("./domain/UnoGame");
const deck_service_1 = require("./deck.service");
const game_repository_1 = require("./game-repository");
let GameLogicService = class GameLogicService {
    deckService;
    gameRepository;
    constructor(deckService, gameRepository) {
        this.deckService = deckService;
        this.gameRepository = gameRepository;
    }
    tryStart(game) {
        if (game.connectedPlayers.size === game.expectedPlayers.length) {
            const started = this.startGame(game);
            if (started) {
                console.log(`Game '${game.roomName}' started !`);
                return started;
            }
        }
        return false;
    }
    startGame(game) {
        if (!game || game.state === UnoGame_1.GameState.PLAYING) {
            return false;
        }
        game.addBots();
        this.randomizePlayerOrder(game);
        game.currentPlayerIndex = 0;
        game.currentDirection = "CLOCKWISE";
        if (!game.currentFamily && game.discard.length > 0) {
            const topCard = game.discard[game.discard.length - 1];
            game.currentFamily = topCard.family;
        }
        game.pendingUnoPlayerIndex = null;
        const now = Date.now();
        game.turnStartTime = now;
        game.lastActionTime = now;
        game.deck = this.deckService.shuffleDeck(this.deckService.createDeck());
        this.deckService.startDeal(game);
        game.state = UnoGame_1.GameState.PLAYING;
        return true;
    }
    randomizePlayerOrder(game) {
        for (let i = game.players.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [game.players[i], game.players[j]] = [game.players[j], game.players[i]];
        }
    }
    doesPlayerHaveCard(cardDto, player) {
        return player._hand.some((c) => c.value === cardDto.cardCode && c.family === cardDto.cardFamily);
    }
    isPlayersTurn(game, playerName) {
        const playerIndex = game.players.findIndex((p) => p._name === playerName);
        return playerIndex === game.currentPlayerIndex;
    }
    reverseTurnOrder(game) {
        game.currentDirection =
            game.currentDirection === "CLOCKWISE" ? "COUNTER-CLOCKWISE" : "CLOCKWISE";
    }
    goToNextPlayerIndex(game) {
        if (game.currentDirection === "CLOCKWISE") {
            game.currentPlayerIndex =
                (game.currentPlayerIndex + 1) % game.players.length;
        }
        else {
            game.currentPlayerIndex =
                (game.currentPlayerIndex - 1 + game.players.length) %
                    game.players.length;
        }
    }
};
exports.GameLogicService = GameLogicService;
exports.GameLogicService = GameLogicService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [deck_service_1.DeckService,
        game_repository_1.GameRepositoryService])
], GameLogicService);
//# sourceMappingURL=game-logic.service.js.map