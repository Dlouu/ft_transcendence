"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeckPile = void 0;
class DeckPile {
    cards;
    constructor(initialCards = []) {
        this.cards = [...initialCards];
    }
    get length() {
        return this.cards.length;
    }
    peek() {
        return this.cards[this.cards.length - 1];
    }
    push(card) {
        return this.cards.push(card);
    }
    pop() {
        return this.cards.pop();
    }
    unshift(card) {
        return this.cards.unshift(card);
    }
    forEach(callback) {
        this.cards.forEach(callback);
    }
    setCards(cards) {
        this.cards = [...cards];
    }
    toArray() {
        return [...this.cards];
    }
    clear() {
        this.cards = [];
    }
}
exports.DeckPile = DeckPile;
//# sourceMappingURL=DeckPile.js.map