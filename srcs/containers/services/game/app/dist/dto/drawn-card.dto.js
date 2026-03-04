"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDrewCardDto = exports.DrawnCardDto = void 0;
const card_dto_1 = require("./card.dto");
class DrawnCardDto {
    name;
    card;
}
exports.DrawnCardDto = DrawnCardDto;
const toDrewCardDto = (player, playedCard) => {
    const playerDrewCardDto = new DrawnCardDto();
    playerDrewCardDto.name = player;
    if (playedCard) {
        const cardDto = new card_dto_1.CardDto();
        cardDto.cardCode = playedCard.value;
        cardDto.cardFamily = playedCard.family;
        playerDrewCardDto.card = cardDto;
    }
    return playerDrewCardDto;
};
exports.toDrewCardDto = toDrewCardDto;
//# sourceMappingURL=drawn-card.dto.js.map