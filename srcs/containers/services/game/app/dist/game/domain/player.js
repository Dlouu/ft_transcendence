"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.player = void 0;
class player {
    _name;
    _isBot;
    _socket;
    constructor(_name, _isBot, _socket) {
        this._name = _name;
        this._isBot = _isBot;
        this._socket = _socket;
    }
    _hand = [];
}
exports.player = player;
//# sourceMappingURL=player.js.map