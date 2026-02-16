"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.game = exports.GameState = void 0;
const player_1 = require("./player");
var GameState;
(function (GameState) {
    GameState[GameState["WAITING_FOR_PLAYERS"] = 0] = "WAITING_FOR_PLAYERS";
    GameState[GameState["DEALING"] = 1] = "DEALING";
    GameState[GameState["PLAYING"] = 2] = "PLAYING";
    GameState[GameState["AWAITING_COLOR_CHOICE"] = 3] = "AWAITING_COLOR_CHOICE";
    GameState[GameState["GAME_OVER"] = 4] = "GAME_OVER";
})(GameState || (exports.GameState = GameState = {}));
class game {
    constructor(name, players, playerNbr, botNbr) {
        this.roomName = name;
        this.players = [];
        for (let i = 0; i < playerNbr; i++) {
            const p = new player_1.player(players[i], false, null);
            this.players.push(p);
        }
        for (let i = 0; i < botNbr; i++) {
            const p = new player_1.player("bot_" + i, true, null);
            this.players.push(p);
        }
        this.currentPlayerIndex = 0;
        this.currentDirection = "CLOCKWISE";
        this.discard = [];
        this.createdAt = Date.now();
        this.connectedPlayers = new Set();
        this.lastActionTime = 0;
        this.pendingUnoPlayerIndex = null;
        this.unoShouted = false;
        this.hasDrawnThisTurn = false;
    }
    toJson() {
        return {
            roomName: this.roomName,
            players: this.players,
            connectedPlayers: Array.from(this.connectedPlayers),
            deck: this.deck,
            discard: this.discard,
            currentFamily: this.currentFamily,
            currentDirection: this.currentDirection,
            currentPlayerIndex: this.currentPlayerIndex,
            createdAt: this.createdAt,
            turnStartTime: this.turnStartTime,
            state: this.state,
            lastActionTime: this.lastActionTime,
            pendingUnoPlayerIndex: this.pendingUnoPlayerIndex,
            unoShouted: this.unoShouted,
        };
    }
    roomName;
    players;
    connectedPlayers;
    realPlayersNbr;
    deck;
    discard;
    currentFamily;
    currentDirection;
    currentPlayerIndex;
    createdAt;
    turnStartTime;
    lastActionTime;
    pendingUnoPlayerIndex;
    unoShouted;
    hasDrawnThisTurn;
    state;
}
exports.game = game;
//# sourceMappingURL=game.js.map