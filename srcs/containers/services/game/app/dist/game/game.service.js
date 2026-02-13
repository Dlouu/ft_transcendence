"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const game_1 = require("./domain/game");
const card_1 = require("./domain/card");
let GameService = class GameService {
    games = [];
    join(playerName) {
        const game = this.findGameByPlayer(playerName);
        if (!game) {
            return null;
        }
        game.connectedPlayers.add(playerName);
        return game;
    }
    leave(playerName) {
        const game = this.findGameByPlayer(playerName);
        if (game) {
            game.connectedPlayers.delete(playerName);
            return game;
        }
        return null;
    }
    findGameByPlayer(playerName) {
        return this.games.find((g) => g.players.some((p) => p._name === playerName));
    }
    create(createGameDto) {
        const { roomName, players, botNbr } = createGameDto;
        const newGame = new game_1.game(roomName, players, players.length, botNbr);
        newGame.deck = this.shuffleDeck(this.createDeck());
        this.startDeal(newGame);
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
        const pushCard = (kind, family, value) => {
            const c = new card_1.card();
            c.kind = kind;
            c.family = family;
            if (value !== undefined)
                c.value = value;
            deck.push(c);
        };
        const colors = [
            card_1.CardFamily.ONE,
            card_1.CardFamily.TWO,
            card_1.CardFamily.THREE,
            card_1.CardFamily.FOUR,
        ];
        for (const color of colors) {
            pushCard(card_1.CardKind.Number, color, 0);
            for (let value = 1; value <= 9; value++) {
                pushCard(card_1.CardKind.Number, color, value);
                pushCard(card_1.CardKind.Number, color, value);
            }
            for (let i = 0; i < 2; i++) {
                pushCard(card_1.CardKind.Skip, color);
                pushCard(card_1.CardKind.Reverse, color);
                pushCard(card_1.CardKind.DrawTwo, color);
            }
        }
        for (let i = 0; i < 4; i++) {
            pushCard(card_1.CardKind.Wild, card_1.CardFamily.WILD);
            pushCard(card_1.CardKind.WildDrawFour, card_1.CardFamily.WILD);
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
    }
    printDeck(game) {
        console.log("Deck:");
        game.deck.forEach((c, i) => {
            console.log(`${i}: ${c.family} ${c.kind} ${c.value ?? ""}`);
        });
    }
    printHands(game) {
        console.log("Players' Hands:");
        for (const p of game.players) {
            console.log(`${p._name}:`);
            p._hand.forEach((c, i) => {
                console.log(`  ${i}: ${c.family} ${c.kind} ${c.value ?? ""}`);
            });
        }
    }
    startDeal(game) {
        const cardsPerPlayer = 7;
        for (const p of game.players) {
            for (let i = 0; i < cardsPerPlayer; i++) {
                const drawnCard = game.deck.pop();
                if (drawnCard) {
                    p._hand.push(drawnCard);
                }
            }
        }
        let firstCard = game.deck.pop();
        while (firstCard && firstCard.kind !== card_1.CardKind.Number) {
            game.deck.unshift(firstCard);
            game.deck = this.shuffleDeck(game.deck);
            firstCard = game.deck.pop();
        }
        if (firstCard) {
            game.discard.push(firstCard);
            game.currentFamily = firstCard.family;
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
    playCard(playerName, playCardDto) {
        const { gameId, card: cardDto, chosenFamily } = playCardDto;
        const game = this.getGameByName(gameId);
        if (!game) {
            throw new Error("Game not found");
        }
        if (!this.isPlayersTurn(game, playerName)) {
            throw new Error("Not your turn");
        }
        const player = game.players.find((p) => p._name === playerName);
        if (!player) {
            throw new Error("Player not found");
        }
        const topCard = game.discard.length > 0 ? game.discard[game.discard.length - 1] : null;
        let isValid = false;
        if (cardDto.cardKind === card_1.CardKind.Wild || cardDto.cardKind === card_1.CardKind.WildDrawFour) {
            isValid = true;
        }
        else {
            if (cardDto.cardFamily === game.currentFamily) {
                isValid = true;
            }
            else if (topCard && topCard.kind === card_1.CardKind.Number && topCard.value === cardDto.value && cardDto.cardKind === card_1.CardKind.Number) {
                isValid = true;
            }
            else if (topCard && topCard.kind === cardDto.cardKind) {
                isValid = true;
            }
        }
        if (!isValid) {
            throw new Error("Invalid card played");
        }
        if (!this.doesPlayerHaveCard(cardDto, player)) {
            throw new Error("You do not possess this card");
        }
        const cardIndex = player._hand.findIndex((c) => c.kind === cardDto.cardKind && c.family === cardDto.cardFamily && c.value === cardDto.value);
        if (cardIndex === -1) {
            throw new Error("Card not found in hand");
        }
        const playedCard = player._hand.splice(cardIndex, 1)[0];
        if (playedCard.kind === card_1.CardKind.Wild || playedCard.kind === card_1.CardKind.WildDrawFour) {
            if (!chosenFamily) {
                throw new Error("Must choose a color for Wild card");
            }
            game.currentFamily = chosenFamily;
        }
        else {
            game.currentFamily = playedCard.family;
        }
        game.discard.push(playedCard);
        if (playedCard.kind === card_1.CardKind.Skip) {
            this.goToNextPlayerIndex(game);
        }
        else if (playedCard.kind === card_1.CardKind.Reverse) {
            this.reverseTurnOrder(game);
            if (game.players.length === 2) {
                this.goToNextPlayerIndex(game);
            }
        }
        else if (playedCard.kind === card_1.CardKind.DrawTwo) {
            this.goToNextPlayerIndex(game);
            const victim = game.players[game.currentPlayerIndex];
            this.drawCardsToPlayer(game, victim, 2);
        }
        else if (playedCard.kind === card_1.CardKind.WildDrawFour) {
            this.goToNextPlayerIndex(game);
            const victim = game.players[game.currentPlayerIndex];
            this.drawCardsToPlayer(game, victim, 4);
        }
        if (player._hand.length === 0) {
            game.state = game_1.GameState.GAME_OVER;
            return;
        }
        if (player._hand.length === 1) {
            game.pendingUnoPlayerIndex = game.players.findIndex((p) => p._name === playerName);
            game.unoShouted = false;
            game.lastActionTime = Date.now();
        }
        game.hasDrawnThisTurn = false;
        this.goToNextPlayerIndex(game);
        game.lastActionTime = Date.now();
    }
    drawCardsToPlayer(game, player, count) {
        for (let i = 0; i < count; i++) {
            if (game.deck.length === 0) {
                this.discardToDeck(game);
            }
            const c = game.deck.pop();
            if (c) {
                player._hand.push(c);
            }
        }
    }
    doesPlayerHaveCard(cardDto, player) {
        return player._hand.some((c) => c.kind === cardDto.cardKind &&
            c.family === cardDto.cardFamily &&
            c.value === cardDto.value);
    }
    isPlayersTurn(game, playerName) {
        const playerIndex = game.players.findIndex((p) => p._name === playerName);
        return playerIndex === game.currentPlayerIndex;
    }
    reverseTurnOrder(game) {
        game.currentDirection =
            game.currentDirection === 'CLOCKWISE' ? 'COUNTER-CLOCKWISE' : 'CLOCKWISE';
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
    }
};
exports.GameService = GameService;
exports.GameService = GameService = __decorate([
    (0, common_1.Injectable)()
], GameService);
//# sourceMappingURL=game.service.js.map