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
exports.PlayCardDto = exports.CardDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const card_1 = require("../domain/card");
class CardDto {
    cardKind;
    cardFamily;
    value;
}
exports.CardDto = CardDto;
__decorate([
    (0, class_validator_1.IsEnum)(card_1.CardKind),
    __metadata("design:type", String)
], CardDto.prototype, "cardKind", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(card_1.CardFamily),
    __metadata("design:type", String)
], CardDto.prototype, "cardFamily", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CardDto.prototype, "value", void 0);
class PlayCardDto {
    gameId;
    card;
    chosenFamily;
}
exports.PlayCardDto = PlayCardDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PlayCardDto.prototype, "gameId", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CardDto),
    __metadata("design:type", CardDto)
], PlayCardDto.prototype, "card", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(card_1.CardFamily),
    __metadata("design:type", String)
], PlayCardDto.prototype, "chosenFamily", void 0);
//# sourceMappingURL=play-card.dto.js.map