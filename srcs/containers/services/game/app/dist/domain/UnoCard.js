"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = exports.isNumberCard = void 0;
const GameEnums_1 = require("./GameEnums");
const isNumberCard = (code) => code === GameEnums_1.CardCode.Zero ||
    code === GameEnums_1.CardCode.One ||
    code === GameEnums_1.CardCode.Two ||
    code === GameEnums_1.CardCode.Three ||
    code === GameEnums_1.CardCode.Four ||
    code === GameEnums_1.CardCode.Five ||
    code === GameEnums_1.CardCode.Six ||
    code === GameEnums_1.CardCode.Seven ||
    code === GameEnums_1.CardCode.Eight ||
    code === GameEnums_1.CardCode.Nine;
exports.isNumberCard = isNumberCard;
class Card {
    constructor() { }
    value;
    family;
}
exports.Card = Card;
//# sourceMappingURL=UnoCard.js.map