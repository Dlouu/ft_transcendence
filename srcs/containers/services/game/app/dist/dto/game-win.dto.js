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
exports.GameWinDto = exports.GameWinPlayerDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class GameWinPlayerDto {
    name;
    id;
    isBot;
    cardsLeft;
}
exports.GameWinPlayerDto = GameWinPlayerDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GameWinPlayerDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GameWinPlayerDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GameWinPlayerDto.prototype, "isBot", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GameWinPlayerDto.prototype, "cardsLeft", void 0);
class GameWinDto {
    winner;
    players;
    gameDuration;
    turnNbr;
}
exports.GameWinDto = GameWinDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GameWinDto.prototype, "winner", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => GameWinPlayerDto),
    __metadata("design:type", Array)
], GameWinDto.prototype, "players", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GameWinDto.prototype, "gameDuration", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GameWinDto.prototype, "turnNbr", void 0);
//# sourceMappingURL=game-win.dto.js.map