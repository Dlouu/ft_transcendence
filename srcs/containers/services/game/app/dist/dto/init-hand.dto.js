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
exports.toInitHandDto = exports.InitHandDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const play_card_dto_1 = require("./play-card.dto");
class InitHandDto {
    hand;
}
exports.InitHandDto = InitHandDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => play_card_dto_1.CardDto),
    __metadata("design:type", Array)
], InitHandDto.prototype, "hand", void 0);
const toInitHandDto = (_hand) => {
    const dto = new InitHandDto();
    dto.hand = _hand.map((card) => {
        const cardDto = new play_card_dto_1.CardDto();
        cardDto.cardCode = card.value;
        cardDto.cardFamily = card.family;
        return cardDto;
    });
    return dto;
};
exports.toInitHandDto = toInitHandDto;
//# sourceMappingURL=init-hand.dto.js.map