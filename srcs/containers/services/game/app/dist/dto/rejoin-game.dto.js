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
exports.toRejoinGameDto = exports.RejoinGameDto = exports.RejoinOpponentHandSizeDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const card_dto_1 = require("./card.dto");
const init_game_dto_1 = require("./init-game.dto");
class RejoinOpponentHandSizeDto {
    index;
    name;
    handSize;
}
exports.RejoinOpponentHandSizeDto = RejoinOpponentHandSizeDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], RejoinOpponentHandSizeDto.prototype, "index", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RejoinOpponentHandSizeDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], RejoinOpponentHandSizeDto.prototype, "handSize", void 0);
class RejoinGameDto {
    playerIndex;
    playerHand;
    opponents;
    currentPlayerIndex;
    turnDirection;
    currentDiscardCard;
}
exports.RejoinGameDto = RejoinGameDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], RejoinGameDto.prototype, "playerIndex", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => card_dto_1.CardDto),
    __metadata("design:type", Array)
], RejoinGameDto.prototype, "playerHand", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => RejoinOpponentHandSizeDto),
    __metadata("design:type", Array)
], RejoinGameDto.prototype, "opponents", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], RejoinGameDto.prototype, "currentPlayerIndex", void 0);
__decorate([
    (0, class_validator_1.IsIn)(["CLOCKWISE", "COUNTER-CLOCKWISE"]),
    __metadata("design:type", String)
], RejoinGameDto.prototype, "turnDirection", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => card_dto_1.CardDto),
    __metadata("design:type", card_dto_1.CardDto)
], RejoinGameDto.prototype, "currentDiscardCard", void 0);
const toRejoinGameDto = (player, game) => {
    const discardTopCard = game.discard.peek();
    if (!discardTopCard) {
        return null;
    }
    let localPlayerIndex = game.players.findIndex((currentPlayer) => currentPlayer._id === player._id);
    if (localPlayerIndex === -1) {
        localPlayerIndex = game.players.findIndex((currentPlayer) => currentPlayer._name === player._name);
    }
    if (localPlayerIndex === -1) {
        return null;
    }
    const dto = new RejoinGameDto();
    dto.playerIndex = localPlayerIndex;
    dto.playerHand = (0, init_game_dto_1.toCardDtoArray)(player._hand);
    dto.opponents = game.players
        .map((otherPlayer, index) => ({ otherPlayer, index }))
        .filter(({ otherPlayer }) => otherPlayer._id !== player._id)
        .map(({ otherPlayer, index }) => {
        const opponentDto = new RejoinOpponentHandSizeDto();
        opponentDto.index = index;
        opponentDto.name = otherPlayer._name;
        opponentDto.handSize = otherPlayer._hand.length;
        return opponentDto;
    });
    dto.currentPlayerIndex = game.currentPlayerIndex;
    dto.turnDirection = game.currentDirection;
    const discardCardDto = new card_dto_1.CardDto();
    discardCardDto.cardCode = discardTopCard.value;
    discardCardDto.cardFamily = discardTopCard.family;
    dto.currentDiscardCard = discardCardDto;
    return dto;
};
exports.toRejoinGameDto = toRejoinGameDto;
//# sourceMappingURL=rejoin-game.dto.js.map