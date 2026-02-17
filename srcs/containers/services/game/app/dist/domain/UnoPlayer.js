"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnoPlayer = void 0;
class UnoPlayer {
    _name;
    _id;
    _isBot;
    _socket;
    constructor(_name, _id, _isBot, _socket) {
        this._name = _name;
        this._id = _id;
        this._isBot = _isBot;
        this._socket = _socket;
    }
    _hand = [];
}
exports.UnoPlayer = UnoPlayer;
//# sourceMappingURL=UnoPlayer.js.map