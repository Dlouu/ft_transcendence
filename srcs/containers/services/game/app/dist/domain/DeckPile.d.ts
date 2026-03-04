import { Card } from "./UnoCard";
export declare class DeckPile {
    private cards;
    constructor(initialCards?: Card[]);
    get length(): number;
    peek(): Card | undefined;
    push(card: Card): number;
    pop(): Card | undefined;
    unshift(card: Card): number;
    forEach(callback: (card: Card, index: number) => void): void;
    setCards(cards: Card[]): void;
    toArray(): Card[];
    clear(): void;
}
