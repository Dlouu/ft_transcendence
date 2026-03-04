"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameState = exports.CardCode = exports.CardFamily = void 0;
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
var GameState;
(function (GameState) {
    GameState[GameState["WAITING_FOR_PLAYERS"] = 0] = "WAITING_FOR_PLAYERS";
    GameState[GameState["DEALING"] = 1] = "DEALING";
    GameState[GameState["PLAYING"] = 2] = "PLAYING";
    GameState[GameState["AWAITING_COLOR_CHOICE"] = 3] = "AWAITING_COLOR_CHOICE";
    GameState[GameState["GAME_OVER"] = 4] = "GAME_OVER";
})(GameState || (exports.GameState = GameState = {}));
//# sourceMappingURL=GameEnums.js.map