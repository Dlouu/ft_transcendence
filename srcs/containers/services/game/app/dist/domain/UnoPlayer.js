"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnoPlayer = exports.generateNickname = void 0;
const COLORS = [
    "red",
    "blue",
    "green",
    "yellow",
    "purple",
    "orange",
    "cyan",
    "magenta",
    "teal",
    "indigo",
    "amber",
    "silver",
];
const ADJECTIVES = [
    "brave",
    "swift",
    "clever",
    "wild",
    "mighty",
    "happy",
    "fierce",
    "sneaky",
    "bold",
    "jolly",
    "noble",
    "shiny",
];
const ANIMALS = [
    "tiger",
    "fox",
    "eagle",
    "wolf",
    "bear",
    "otter",
    "panda",
    "falcon",
    "lynx",
    "dolphin",
    "raven",
    "gecko",
];
const pickRandom = (words) => words[Math.floor(Math.random() * words.length)];
const generateNickname = () => `${pickRandom(COLORS)}-${pickRandom(ADJECTIVES)}-${pickRandom(ANIMALS)}`;
exports.generateNickname = generateNickname;
class UnoPlayer {
    _id;
    _name;
    _socket;
    _isBot;
    _cardBack;
    hasShoutedUno = false;
    hasDrawThisTurn = false;
    constructor(_id, _name = (0, exports.generateNickname)(), _socket = null, _isBot = false, _cardBack = "uwu") {
        this._id = _id;
        this._name = _name;
        this._socket = _socket;
        this._isBot = _isBot;
        this._cardBack = _cardBack;
    }
    _hand = [];
}
exports.UnoPlayer = UnoPlayer;
//# sourceMappingURL=UnoPlayer.js.map