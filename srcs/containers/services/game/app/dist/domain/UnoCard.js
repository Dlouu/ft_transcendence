"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = exports.isNumberCard = exports.CardCode = exports.CardFamily = void 0;
var CardFamily;
(function (CardFamily) {
    CardFamily["ONE"] = "set-one";
    CardFamily["TWO"] = "set-two";
    CardFamily["THREE"] = "set-three";
    CardFamily["FOUR"] = "set-four";
    CardFamily["WILD"] = "wild";
})(CardFamily || (exports.CardFamily = CardFamily = {}));
var CardCode;
(function (CardCode) {
    CardCode["Zero"] = "zero";
    CardCode["One"] = "one";
    CardCode["Two"] = "two";
    CardCode["Three"] = "three";
    CardCode["Four"] = "four";
    CardCode["Five"] = "five";
    CardCode["Six"] = "six";
    CardCode["Seven"] = "seven";
    CardCode["Eight"] = "eight";
    CardCode["Nine"] = "nine";
    CardCode["Skip"] = "skip";
    CardCode["Reverse"] = "reverse";
    CardCode["DrawTwo"] = "drawTwo";
    CardCode["Wild"] = "wild";
    CardCode["WildDrawFour"] = "wildDrawFour";
})(CardCode || (exports.CardCode = CardCode = {}));
const isNumberCard = (code) => code === CardCode.Zero ||
    code === CardCode.One ||
    code === CardCode.Two ||
    code === CardCode.Three ||
    code === CardCode.Four ||
    code === CardCode.Five ||
    code === CardCode.Six ||
    code === CardCode.Seven ||
    code === CardCode.Eight ||
    code === CardCode.Nine;
exports.isNumberCard = isNumberCard;
class Card {
    constructor() { }
    value;
    family;
}
exports.Card = Card;
//# sourceMappingURL=UnoCard.js.map