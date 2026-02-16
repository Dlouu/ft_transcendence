"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.card = exports.CardKind = exports.CardFamily = void 0;
var CardFamily;
(function (CardFamily) {
    CardFamily["ONE"] = "ONE";
    CardFamily["TWO"] = "TWO";
    CardFamily["THREE"] = "THREE";
    CardFamily["FOUR"] = "FOUR";
    CardFamily["WILD"] = "WILD";
})(CardFamily || (exports.CardFamily = CardFamily = {}));
var CardKind;
(function (CardKind) {
    CardKind["Number"] = "Number";
    CardKind["Skip"] = "Skip";
    CardKind["Reverse"] = "Reverse";
    CardKind["DrawTwo"] = "DrawTwo";
    CardKind["Wild"] = "Wild";
    CardKind["WildDrawFour"] = "WildDrawFour";
})(CardKind || (exports.CardKind = CardKind = {}));
class card {
    constructor() { }
    kind;
    family;
    value;
}
exports.card = card;
//# sourceMappingURL=card.js.map