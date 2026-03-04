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
exports.toPlayedCardDto = exports.PlayedCardDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const card_dto_1 = require("../dto/card.dto");
class PlayedCardDto {
    name;
    cardIndex;
    card;
}
exports.PlayedCardDto = PlayedCardDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PlayedCardDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayedCardDto.prototype, "cardIndex", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => card_dto_1.CardDto),
    __metadata("design:type", card_dto_1.CardDto)
], PlayedCardDto.prototype, "card", void 0);
const toPlayedCardDto = (player, playedCard, cardIndex) => {
    const playerPlayedCardDto = new PlayedCardDto();
    playerPlayedCardDto.name = player;
    playerPlayedCardDto.cardIndex = cardIndex;
    const cardDto = new card_dto_1.CardDto();
    cardDto.cardCode = playedCard.value;
    cardDto.cardFamily = playedCard.family;
    playerPlayedCardDto.card = cardDto;
    return playerPlayedCardDto;
};
exports.toPlayedCardDto = toPlayedCardDto;
//# sourceMappingURL=played-card.dto.js.map