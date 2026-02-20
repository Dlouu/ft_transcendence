"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = exports.GameState = void 0;
const UnoPlayer_1 = require("./UnoPlayer");
var GameState;
(function (GameState) {
    GameState[GameState["WAITING_FOR_PLAYERS"] = 0] = "WAITING_FOR_PLAYERS";
    GameState[GameState["DEALING"] = 1] = "DEALING";
    GameState[GameState["PLAYING"] = 2] = "PLAYING";
    GameState[GameState["AWAITING_COLOR_CHOICE"] = 3] = "AWAITING_COLOR_CHOICE";
    GameState[GameState["GAME_OVER"] = 4] = "GAME_OVER";
})(GameState || (exports.GameState = GameState = {}));
class Game {
    roomName;
    players;
    connectedPlayers;
    expectedPlayers;
    realPlayersNbr;
    botNbr;
    deck;
    discard;
    currentFamily;
    currentDirection;
    currentPlayerIndex;
    createdAt;
    turnStartTime;
    lastActionTime;
    pendingUnoPlayerIndex;
    state;
    constructor(name, players, playerNbr, botNbr) {
        this.roomName = name;
        this.expectedPlayers = players;
        this.realPlayersNbr = playerNbr;
        this.botNbr = botNbr;
        this.players = [];
        this.deck = [];
        this.currentPlayerIndex = 0;
        this.currentDirection = "CLOCKWISE";
        this.discard = [];
        this.createdAt = Date.now();
        this.connectedPlayers = new Set();
        this.lastActionTime = 0;
        this.pendingUnoPlayerIndex = null;
    }
    toJson() {
        return {
            roomName: this.roomName,
            expectedPlayers: this.expectedPlayers,
            players: this.players.map((player) => ({
                name: player._name,
                isBot: player._isBot,
                handSize: player._hand.length,
            })),
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
        };
    }
    addBots() {
        for (let i = 0; i < this.botNbr; i++) {
            const botName = (0, UnoPlayer_1.generateNickname)();
            this.players.push(new UnoPlayer_1.UnoPlayer(botName + "_id", botName, null, true));
        }
    }
    addPlayer(player) {
        const realPlayersCount = this.players.filter((existingPlayer) => !existingPlayer._isBot).length;
        if (realPlayersCount >= this.realPlayersNbr) {
            return false;
        }
        this.players.push(player);
        return true;
    }
    removePlayer(playerId) {
        const playerIndex = this.players.findIndex((player) => player._id === playerId);
        if (playerIndex === -1) {
            return false;
        }
        this.players.splice(playerIndex, 1);
        return true;
    }
}
exports.Game = Game;
//# sourceMappingURL=UnoGame.js.map