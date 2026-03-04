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
const GameEnums_1 = require("./domain/GameEnums");
const deck_service_1 = require("./deck.service");
const game_repository_1 = require("./game-repository");
let GameLogicService = class GameLogicService {
    deckService;
    gameRepository;
    colorPickCallbacks = new Map();
    unoRevealDelayMs = 500;
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
        if (!game || game.state === GameEnums_1.GameState.PLAYING) {
            return false;
        }
        game.addBots();
        this.randomizePlayerOrder(game);
        game.currentPlayerIndex = 0;
        game.currentDirection = "CLOCKWISE";
        if (!game.currentFamily && game.discard.length > 0) {
            const topCard = game.discard.peek();
            if (!topCard) {
                return false;
            }
            game.currentFamily = topCard.family;
        }
        game.pendingUnoPlayerIndex = null;
        const now = Date.now();
        game.turnStartTime = now;
        game.lastActionTime = now;
        game.deck.setCards(this.deckService.shuffleDeck(this.deckService.createDeck()));
        this.deckService.startDeal(game);
        game.state = GameEnums_1.GameState.PLAYING;
        return true;
    }
    randomizePlayerOrder(game) {
        for (let i = game.players.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [game.players[i], game.players[j]] = [game.players[j], game.players[i]];
        }
    }
    doesPlayerHaveCard(cardDto, player) {
        return player._hand.findIndex((c) => c.value === cardDto.cardCode && c.family === cardDto.cardFamily);
    }
    isPlayersTurn(game, player) {
        const playerIndex = game.players.findIndex((p) => p._name === player._name);
        return playerIndex === game.currentPlayerIndex;
    }
    isPlayable(topCard, playingCard) {
        if (!topCard || !playingCard) {
            return false;
        }
        if (playingCard.cardCode === GameEnums_1.CardCode.Wild ||
            playingCard.cardCode === GameEnums_1.CardCode.WildDrawFour) {
            return true;
        }
        return (topCard.family === playingCard.cardFamily ||
            topCard.value === playingCard.cardCode);
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
    getNextPlayer(game) {
        if (game.currentDirection === "CLOCKWISE") {
            const nextIndex = (game.currentPlayerIndex + 1) % game.players.length;
            return game.players[nextIndex];
        }
        const nextIndex = (game.currentPlayerIndex - 1 + game.players.length) % game.players.length;
        return game.players[nextIndex];
    }
    randomCardFamily() {
        const playableFamilies = [
            GameEnums_1.CardFamily.ONE,
            GameEnums_1.CardFamily.TWO,
            GameEnums_1.CardFamily.THREE,
            GameEnums_1.CardFamily.FOUR,
        ];
        const randomIndex = Math.floor(Math.random() * playableFamilies.length);
        return playableFamilies[randomIndex];
    }
    formatDurationToDdHhMmSs(durationMs) {
        const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
        const days = Math.min(99, Math.floor(totalSeconds / 86400));
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return Number(`${days.toString().padStart(2, "0")}${hours
            .toString()
            .padStart(2, "0")}${minutes.toString().padStart(2, "0")}${seconds
            .toString()
            .padStart(2, "0")}`);
    }
    async askPlayerColor(game, player) {
        if (!player._socket) {
            return this.randomCardFamily();
        }
        player._socket.emit("game:wild:choose-color");
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                this.colorPickCallbacks.delete(player._id);
                resolve(this.randomCardFamily());
            }, 10000);
            this.colorPickCallbacks.set(player._id, (color) => {
                clearTimeout(timeout);
                this.colorPickCallbacks.delete(player._id);
                resolve(color);
            });
        });
    }
    onColorPicked(playerId, color) {
        const callback = this.colorPickCallbacks.get(playerId);
        if (callback) {
            callback(color);
        }
    }
    onUno(game, player) {
        if (!player._socket) {
            return;
        }
        const playerIndex = game.players.findIndex((p) => p._id === player._id);
        if (playerIndex === -1) {
            return;
        }
        game.pendingUnoPlayerIndex = playerIndex;
        player.hasShoutedUno = false;
        player._socket.emit("game:uno:pending:self");
        setTimeout(() => {
            const pendingIndex = game.pendingUnoPlayerIndex;
            if (pendingIndex === null) {
                return;
            }
            const pendingPlayer = game.players[pendingIndex];
            if (!pendingPlayer || pendingPlayer._id !== player._id || pendingPlayer._hand.length !== 1) {
                return;
            }
            player._socket?.to(game.roomName).emit("game:uno:pending:others");
        }, this.unoRevealDelayMs);
    }
    onVictory(game, winner) {
        if (!game || !winner || game.state === GameEnums_1.GameState.GAME_OVER) {
            return;
        }
        const winnerStillInGame = game.players.some((p) => p._id === winner._id);
        if (!winnerStillInGame || winner._hand.length !== 0) {
            return;
        }
        game.state = GameEnums_1.GameState.GAME_OVER;
        game.pendingUnoPlayerIndex = null;
        for (const player of game.players) {
            this.colorPickCallbacks.delete(player._id);
        }
        const durationDdHhMmSs = this.formatDurationToDdHhMmSs(Date.now() - game.createdAt);
        const dto = {
            winner: winner._name,
            players: game.players.map((player) => ({
                name: player._name,
                id: player._id,
                isBot: player._isBot,
                cardsLeft: player._hand.length,
            })),
            gameDuration: durationDdHhMmSs,
            turnNbr: Math.max(0, game.discard.length - 1),
        };
        const emitterPlayer = game.players.find((player) => !!player._socket);
        if (emitterPlayer?._socket) {
            emitterPlayer._socket.emit("game:win", dto);
            emitterPlayer._socket.to(game.roomName).emit("game:win", dto);
        }
        this.gameRepository.deleteGame(game);
        console.log(`Game '${game.roomName}' won by '${winner._name}'. Game closed.`);
    }
};
exports.GameLogicService = GameLogicService;
exports.GameLogicService = GameLogicService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [deck_service_1.DeckService,
        game_repository_1.GameRepositoryService])
], GameLogicService);
//# sourceMappingURL=game-logic.service.js.map