"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const init_hand_dto_1 = require("./dto/init-hand.dto");
const common_1 = require("@nestjs/common");
const UnoGame_1 = require("./domain/UnoGame");
const UnoCard_1 = require("./domain/UnoCard");
let GameService = class GameService {
    io;
    games = [];
    setServer(io) {
        this.io = io;
    }
    join(playerId, game, socket) {
        if (!game) {
            return;
        }
        const player = game.players.find((p) => p._name === playerId);
        if (player) {
            player._socket = socket;
        }
        game.connectedPlayers.add(playerId);
        if (game.state == UnoGame_1.GameState.PLAYING || game.state == UnoGame_1.GameState.AWAITING_COLOR_CHOICE)
            this.rejoin(this.findPlayerInGame(game, playerId));
    }
    rejoin(player) {
        if (!player)
            return;
    }
    findPlayerInGame(game, playerId) {
        if (!game) {
            return null;
        }
        const player = game.players.find((p) => p._name === playerId);
        if (!player) {
            return null;
        }
        return player;
    }
    tryStart(game) {
        if (this.io && game.connectedPlayers.size === game.players.length) {
            this.startGame(game);
            console.log(`Game '${game.roomName}' started !`);
        }
    }
    leave(playerName) {
        const game = this.findGameByPlayer(playerName);
        return game ?? null;
    }
    deleteGame(game) {
        this.games = this.games.filter((existingGame) => existingGame !== game);
    }
    startGame(game) {
        if (!game || game.state === UnoGame_1.GameState.PLAYING) {
            return;
        }
        this.randomizePlayerOrder(game);
        game.currentPlayerIndex = 0;
        game.currentDirection = "CLOCKWISE";
        if (!game.currentFamily && game.discard.length > 0) {
            const topCard = game.discard[game.discard.length - 1];
            game.currentFamily = topCard.family;
        }
        game.pendingUnoPlayerIndex = null;
        game.unoShouted = false;
        game.hasDrawnThisTurn = false;
        const now = Date.now();
        game.turnStartTime = now;
        game.lastActionTime = now;
        game.deck = this.shuffleDeck(this.createDeck());
        this.startDeal(game);
        game.state = UnoGame_1.GameState.PLAYING;
    }
    findGameByPlayer(playerName) {
        return this.games.find((g) => g.players.some((p) => p._name === playerName));
    }
    create(createGameDto) {
        const { roomName, players, botNbr } = createGameDto;
        if (this.getGameByName(roomName)) {
            throw new common_1.ConflictException("Game name already exists");
        }
        const newGame = new UnoGame_1.Game(roomName, players, players.length, botNbr);
        newGame.state = UnoGame_1.GameState.WAITING_FOR_PLAYERS;
        this.games.push(newGame);
        console.log("Game " + newGame.roomName + " has been created !");
        return newGame;
    }
    getGameByName(name) {
        return this.games.find((g) => g.roomName === name);
    }
    randomizePlayerOrder(game) {
        for (let i = game.players.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [game.players[i], game.players[j]] = [game.players[j], game.players[i]];
        }
    }
    createDeck() {
        const deck = [];
        const pushCard = (code, family) => {
            const c = new UnoCard_1.Card();
            c.value = code;
            c.family = family;
            deck.push(c);
        };
        const colors = [
            UnoCard_1.CardFamily.ONE,
            UnoCard_1.CardFamily.TWO,
            UnoCard_1.CardFamily.THREE,
            UnoCard_1.CardFamily.FOUR,
        ];
        const numberCards = [
            UnoCard_1.CardCode.One,
            UnoCard_1.CardCode.Two,
            UnoCard_1.CardCode.Three,
            UnoCard_1.CardCode.Four,
            UnoCard_1.CardCode.Five,
            UnoCard_1.CardCode.Six,
            UnoCard_1.CardCode.Seven,
            UnoCard_1.CardCode.Eight,
            UnoCard_1.CardCode.Nine,
        ];
        for (const color of colors) {
            pushCard(UnoCard_1.CardCode.Zero, color);
            for (const numberCard of numberCards) {
                pushCard(numberCard, color);
                pushCard(numberCard, color);
            }
            for (let i = 0; i < 2; i++) {
                pushCard(UnoCard_1.CardCode.Skip, color);
                pushCard(UnoCard_1.CardCode.Reverse, color);
                pushCard(UnoCard_1.CardCode.DrawTwo, color);
            }
        }
        for (let i = 0; i < 4; i++) {
            pushCard(UnoCard_1.CardCode.Wild, UnoCard_1.CardFamily.WILD);
            pushCard(UnoCard_1.CardCode.WildDrawFour, UnoCard_1.CardFamily.WILD);
        }
        return deck;
    }
    shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }
    discardToDeck(game) {
        if (game.discard.length <= 1)
            return;
        const topCard = game.discard.pop();
        game.deck = this.shuffleDeck([...game.deck, ...game.discard]);
        game.discard = [];
        if (topCard) {
            game.discard.push(topCard);
        }
        this.io?.to(game.roomName).emit("game:discardToDeck");
    }
    printDeck(game) {
        console.log("Deck:");
        game.deck.forEach((c, i) => {
            console.log(`${i}: ${c.family} ${c.value}`);
        });
    }
    printHands(game) {
        console.log("Players' Hands:");
        for (const p of game.players) {
            console.log(`${p._name}:`);
            p._hand.forEach((c, i) => {
                console.log(`  ${i}: ${c.family} ${c.value}`);
            });
        }
    }
    startDeal(game) {
        const cardsPerPlayer = 7;
        game.state = UnoGame_1.GameState.DEALING;
        for (const p of game.players) {
            for (let i = 0; i < cardsPerPlayer; i++) {
                const drawnCard = game.deck.pop();
                if (drawnCard) {
                    p._hand.push(drawnCard);
                }
            }
            if (p._socket)
                p._socket.emit("game:initHand", (0, init_hand_dto_1.toInitHandDto)(p._hand));
        }
        let firstCard = game.deck.pop();
        while (firstCard && !(0, UnoCard_1.isNumberCard)(firstCard.value)) {
            game.deck.unshift(firstCard);
            game.deck = this.shuffleDeck(game.deck);
            firstCard = game.deck.pop();
        }
        if (firstCard) {
            game.discard.push(firstCard);
            game.currentFamily = firstCard.family;
            this.io?.to(game.roomName).emit("game:start", { firstCard: firstCard });
        }
    }
    shoutUno(playerName) {
        const game = this.findGameByPlayer(playerName);
        if (!game || game.pendingUnoPlayerIndex === null) {
            return;
        }
        const elapsed = Date.now() - game.lastActionTime;
        const SHOUTING_SECONDS = 3;
        const ADVANTAGE_SECONDS = 0.5;
        const UNO_WINDOW = SHOUTING_SECONDS * 1000;
        const ADVANTAGE_WINDOW = ADVANTAGE_SECONDS * 1000;
        if (elapsed > UNO_WINDOW) {
            return;
        }
        const pendingPlayer = game.players[game.pendingUnoPlayerIndex];
        if (!pendingPlayer)
            return;
        if (pendingPlayer._name === playerName) {
            if (!game.unoShouted) {
                game.unoShouted = true;
            }
        }
        else {
            if (elapsed < ADVANTAGE_WINDOW) {
                return;
            }
            if (!game.unoShouted) {
                for (let i = 0; i < 2; i++) {
                    if (game.deck.length === 0) {
                        this.discardToDeck(game);
                    }
                    const c = game.deck.pop();
                    if (c)
                        pendingPlayer._hand.push(c);
                }
                game.pendingUnoPlayerIndex = null;
                game.unoShouted = false;
            }
        }
    }
    passTurn(gameId, playerName) {
        const game = this.getGameByName(gameId);
        if (!game) {
            throw new Error("Game not found");
        }
        if (!this.isPlayersTurn(game, playerName)) {
            throw new Error("Not your turn");
        }
        if (!game.hasDrawnThisTurn) {
            throw new Error("You must draw a card before passing");
        }
        game.hasDrawnThisTurn = false;
        this.goToNextPlayerIndex(game);
        game.lastActionTime = Date.now();
    }
    drawCard(gameId, playerName) {
        const game = this.getGameByName(gameId);
        if (!game) {
            throw new Error("Game not found");
        }
        if (!this.isPlayersTurn(game, playerName)) {
            throw new Error("Not your turn");
        }
        if (game.hasDrawnThisTurn) {
            throw new Error("You have already drawn a card this turn");
        }
        if (game.deck.length === 0) {
            this.discardToDeck(game);
        }
        if (game.deck.length === 0) {
            return;
        }
        const card = game.deck.pop();
        const player = game.players.find((p) => p._name === playerName);
        if (player && card) {
            player._hand.push(card);
            game.hasDrawnThisTurn = true;
        }
    }
    playCard(playerName) {
    }
    doesPlayerHaveCard(cardDto, player) {
        return player._hand.some((c) => c.value === cardDto.cardCode && c.family === cardDto.cardFamily);
    }
    isPlayersTurn(game, playerName) {
        const playerIndex = game.players.findIndex((p) => p._name === playerName);
        return playerIndex === game.currentPlayerIndex;
    }
    reverseTurnOrder(game) {
        game.currentDirection =
            game.currentDirection === 'CLOCKWISE' ? 'COUNTER-CLOCKWISE' : 'CLOCKWISE';
        this.io?.to(game.roomName).emit("game:directionChanged", game.currentDirection);
    }
    goToNextPlayerIndex(game) {
        if (game.currentDirection === 'CLOCKWISE') {
            game.currentPlayerIndex =
                (game.currentPlayerIndex + 1) % game.players.length;
        }
        else {
            game.currentPlayerIndex =
                (game.currentPlayerIndex - 1 + game.players.length) %
                    game.players.length;
        }
        this.io?.to(game.roomName).emit("game:currentPlayerChanged", game.currentPlayerIndex);
    }
};
exports.GameService = GameService;
exports.GameService = GameService = __decorate([
    (0, common_1.Injectable)()
], GameService);
//# sourceMappingURL=game.service.js.map