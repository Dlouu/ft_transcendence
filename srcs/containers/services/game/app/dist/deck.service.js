"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeckService = void 0;
const common_1 = require("@nestjs/common");
const UnoCard_1 = require("./domain/UnoCard");
const UnoGame_1 = require("./domain/UnoGame");
const init_hand_dto_1 = require("./dto/init-hand.dto");
let DeckService = class DeckService {
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
    shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
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
        }
    }
};
exports.DeckService = DeckService;
exports.DeckService = DeckService = __decorate([
    (0, common_1.Injectable)()
], DeckService);
//# sourceMappingURL=deck.service.js.map