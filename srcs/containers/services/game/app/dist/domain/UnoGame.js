"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const UnoPlayer_1 = require("./UnoPlayer");
const DeckPile_1 = require("./DeckPile");
class Game {
    roomName;
    cardTheme;
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
    constructor(name, players, playerNbr, botNbr, cardTheme) {
        this.roomName = name;
        this.cardTheme = cardTheme;
        this.expectedPlayers = players;
        this.realPlayersNbr = playerNbr;
        this.botNbr = botNbr;
        this.players = [];
        this.deck = new DeckPile_1.DeckPile();
        this.currentPlayerIndex = 0;
        this.currentDirection = "CLOCKWISE";
        this.discard = new DeckPile_1.DeckPile();
        this.connectedPlayers = new Set();
        this.lastActionTime = 0;
        this.pendingUnoPlayerIndex = null;
    }
    toJson() {
        return {
            roomName: this.roomName,
            cardTheme: this.cardTheme,
            expectedPlayers: this.expectedPlayers,
            players: this.players.map((player) => ({
                name: player._name,
                isBot: player._isBot,
                handSize: player._hand.length,
            })),
            connectedPlayers: Array.from(this.connectedPlayers),
            deck: this.deck.toArray(),
            discard: this.discard.toArray(),
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