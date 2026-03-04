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
exports.GamePlayService = void 0;
const game_logic_service_1 = require("./game-logic.service");
const common_1 = require("@nestjs/common");
const deck_service_1 = require("./deck.service");
const GameEnums_1 = require("./domain/GameEnums");
const played_card_dto_1 = require("./dto/played-card.dto");
const game_service_1 = require("./game.service");
const drawn_card_dto_1 = require("./dto/drawn-card.dto");
const game_repository_1 = require("./game-repository");
let GamePlayService = class GamePlayService {
    deckService;
    gameLogicService;
    gameRepository;
    gameService;
    constructor(deckService, gameLogicService, gameRepository, gameService) {
        this.deckService = deckService;
        this.gameLogicService = gameLogicService;
        this.gameRepository = gameRepository;
        this.gameService = gameService;
    }
    getIoServer() {
        return this.gameService.getServer();
    }
    playValueCard(game, playedCard) {
        game.discard.push(playedCard);
        game.currentFamily = playedCard.family;
        return true;
    }
    playSkipCard(game, playedCard) {
        game.discard.push(playedCard);
        game.currentFamily = playedCard.family;
        this.gameLogicService.goToNextPlayerIndex(game);
        return true;
    }
    playReverseCard(game, playedCard) {
        game.discard.push(playedCard);
        game.currentFamily = playedCard.family;
        this.gameLogicService.reverseTurnOrder(game);
        if (game.players.length === 2)
            this.gameLogicService.goToNextPlayerIndex(game);
        this.getIoServer()?.to(game.roomName).emit("game:turn:reverse");
        return true;
    }
    playDrawTwoCard(game, playedCard) {
        game.discard.push(playedCard);
        game.currentFamily = playedCard.family;
        this.drawCard(game, 2, true, this.gameLogicService.getNextPlayer(game));
        this.gameLogicService.goToNextPlayerIndex(game);
        return true;
    }
    async playWildCard(game, playedCard, player) {
        game.discard.push(playedCard);
        const chosenFamily = await this.gameLogicService.askPlayerColor(game, player);
        console.log(`Choosen color: ${chosenFamily}`);
        game.currentFamily = chosenFamily;
        playedCard.family = chosenFamily;
        this.getIoServer()?.to(game.roomName).emit("game:wild:new-color", { chosenFamily });
        console.log(`Wild current family : ${game.currentFamily}`);
        return true;
    }
    async playWildDrawFourCard(game, playedCard, player) {
        game.discard.push(playedCard);
        const targetPlayer = this.gameLogicService.getNextPlayer(game);
        const chosenFamily = await this.gameLogicService.askPlayerColor(game, player);
        console.log(`Choosen color: ${chosenFamily}`);
        this.drawCard(game, 4, true, targetPlayer);
        this.gameLogicService.goToNextPlayerIndex(game);
        game.currentFamily = chosenFamily;
        playedCard.family = chosenFamily;
        this.getIoServer()?.to(game.roomName).emit("game:wild:new-color", { chosenFamily });
        console.log(`Wild current family : ${game.currentFamily}`);
        return true;
    }
    async playCard(game, dto, player) {
        if (!this.gameLogicService.isPlayersTurn(game, player)) {
            console.log(`It's not player ${player._name}'s turn is not in the game ${game.roomName}`);
            return false;
        }
        const cardIndex = this.gameLogicService.doesPlayerHaveCard(dto, player);
        if (cardIndex === -1) {
            console.log(`Player ${player._name} is not in the game ${game.roomName} does not have the card ${dto.cardCode} ${dto.cardFamily}`);
            return false;
        }
        const [playedCard] = player._hand.splice(cardIndex, 1);
        if (!playedCard) {
            return false;
        }
        const topCard = game.discard.peek();
        if (!this.gameLogicService.isPlayable(topCard, dto)) {
            console.log(`Player ${player._name}'s card is not playable in the game ${game.roomName}`);
            player._hand.splice(cardIndex, 0, playedCard);
            return false;
        }
        player._socket?.emit("game:played:card:self", (0, played_card_dto_1.toPlayedCardDto)(player._name, playedCard, cardIndex));
        player._socket?.to(game.roomName).emit("game:played:card:others", (0, played_card_dto_1.toPlayedCardDto)(player._name, playedCard, cardIndex));
        if (game.deck.length === 0) {
            this.deckService.discardToDeck(game);
            this.getIoServer()?.to(game.roomName).emit("game:deck:shuffled");
        }
        let hasBeenPlayed = false;
        switch (dto.cardCode) {
            case GameEnums_1.CardCode.Reverse:
                hasBeenPlayed = this.playReverseCard(game, playedCard);
                break;
            case GameEnums_1.CardCode.Skip:
                hasBeenPlayed = this.playSkipCard(game, playedCard);
                break;
            case GameEnums_1.CardCode.DrawTwo:
                hasBeenPlayed = this.playDrawTwoCard(game, playedCard);
                break;
            case GameEnums_1.CardCode.Wild:
                hasBeenPlayed = await this.playWildCard(game, playedCard, player);
                break;
            case GameEnums_1.CardCode.WildDrawFour:
                hasBeenPlayed = await this.playWildDrawFourCard(game, playedCard, player);
                break;
            default:
                hasBeenPlayed = this.playValueCard(game, playedCard);
                break;
        }
        if (!hasBeenPlayed) {
            player._hand.splice(cardIndex, 0, playedCard);
            return false;
        }
        return true;
    }
    shoutUno(game, player) {
        const unoPenaltyCards = 2;
        const pendingIndex = game.pendingUnoPlayerIndex;
        if (pendingIndex === null) {
            return false;
        }
        const pendingPlayer = game.players[pendingIndex];
        if (!pendingPlayer || pendingPlayer._hand.length !== 1) {
            game.pendingUnoPlayerIndex = null;
            return false;
        }
        if (pendingPlayer._id === player._id) {
            pendingPlayer.hasShoutedUno = true;
            game.pendingUnoPlayerIndex = null;
            this.getIoServer()?.to(game.roomName).emit("game:uno:catched");
            return true;
        }
        game.pendingUnoPlayerIndex = null;
        if (!this.drawCard(game, unoPenaltyCards, true, pendingPlayer)) {
            this.getIoServer()?.to(game.roomName).emit("game:uno:catched");
            return false;
        }
        this.getIoServer()?.to(game.roomName).emit("game:uno:catched");
        return true;
    }
    drawCard(game, iterNbr, isDrawCard, player) {
        if (!this.gameLogicService.isPlayersTurn(game, player) && !isDrawCard) {
            console.log(`It's not player ${player._id}'s turn is not in the game ${game.roomName}`);
            return false;
        }
        if (game.deck.length === 0) {
            this.deckService.discardToDeck(game);
            if (game.deck.length === 0)
                this.getIoServer()?.to(game.roomName).emit("game:deck:empty");
            else
                this.getIoServer()?.to(game.roomName).emit("game:deck:shuffled");
        }
        for (let i = 0; i < iterNbr; i++) {
            const card = game.deck.pop();
            if (!card) {
                console.log(`Game ${game.roomName} has nore more card available in the deck.`);
                return false;
            }
            player._hand.push(card);
            player.hasDrawThisTurn = true;
            console.log(`Player ${player._name} drew the card ${card.value} ${card.family}`);
            player._socket?.emit("game:draw:self", (0, drawn_card_dto_1.toDrewCardDto)(player._name, card));
            player._socket?.to(game.roomName).emit("game:draw:others", (0, drawn_card_dto_1.toDrewCardDto)(player._name, undefined));
        }
        return true;
    }
};
exports.GamePlayService = GamePlayService;
exports.GamePlayService = GamePlayService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => game_service_1.GameService))),
    __metadata("design:paramtypes", [deck_service_1.DeckService,
        game_logic_service_1.GameLogicService,
        game_repository_1.GameRepositoryService,
        game_service_1.GameService])
], GamePlayService);
//# sourceMappingURL=game-play.service.js.map