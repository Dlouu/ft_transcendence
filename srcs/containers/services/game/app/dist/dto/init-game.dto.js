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
exports.toCardDtoArray = exports.InitGameDto = exports.InitPlayerDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const card_dto_1 = require("./card.dto");
class InitPlayerDto {
    name;
    cardBack;
}
exports.InitPlayerDto = InitPlayerDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitPlayerDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitPlayerDto.prototype, "cardBack", void 0);
class InitGameDto {
    playerHand;
    players;
    discardTopCard;
    firstPlayerIndex;
    turnDirection;
    startCardNbr;
    playerIndex;
    cardTheme;
}
exports.InitGameDto = InitGameDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => card_dto_1.CardDto),
    __metadata("design:type", Array)
], InitGameDto.prototype, "playerHand", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => InitPlayerDto),
    __metadata("design:type", Array)
], InitGameDto.prototype, "players", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => card_dto_1.CardDto),
    __metadata("design:type", card_dto_1.CardDto)
], InitGameDto.prototype, "discardTopCard", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InitGameDto.prototype, "firstPlayerIndex", void 0);
__decorate([
    (0, class_validator_1.IsIn)(["CLOCKWISE", "COUNTER-CLOCKWISE"]),
    __metadata("design:type", String)
], InitGameDto.prototype, "turnDirection", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], InitGameDto.prototype, "startCardNbr", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InitGameDto.prototype, "playerIndex", void 0);
__decorate([
    (0, class_validator_1.IsIn)(["basic", "uwu"]),
    __metadata("design:type", String)
], InitGameDto.prototype, "cardTheme", void 0);
const toCardDtoArray = (_hand) => {
    return _hand.map((card) => {
        const cardDto = new card_dto_1.CardDto();
        cardDto.cardCode = card.value;
        cardDto.cardFamily = card.family;
        return cardDto;
    });
};
exports.toCardDtoArray = toCardDtoArray;
//# sourceMappingURL=init-game.dto.js.map