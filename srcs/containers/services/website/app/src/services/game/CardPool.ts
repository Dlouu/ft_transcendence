import { Container } from 'pixi.js';
import { UnoCard } from './UnoCard';

export class CardPool
{
    private _availableCards: UnoCard[] = [];
    private _activeCards: UnoCard[] = [];
    private _rootContainer: Container;

    // Standard Uno deck is 108, maybe add buffer just in case
    private readonly POOL_SIZE = 120; 

    constructor(rootContainer: Container)
    {
        this._rootContainer = rootContainer;
        this.initializePool();
    }

    private initializePool(): void
    {
        for (let i = 0; i < this.POOL_SIZE; i++)
        {
            const card = new UnoCard();
            // We add them to the stage immediately but they are invisible
            this._rootContainer.addChild(card);
            this._availableCards.push(card);
        }
    }

    public getCard(): UnoCard
    {
        let card: UnoCard;

        if (this._availableCards.length > 0)
        {
            card = this._availableCards.pop()!;
        }
        else
        {
            // Expand pool if necessary (edge case)
            card = new UnoCard();
            this._rootContainer.addChild(card);
        }

        this._activeCards.push(card);
        card.visible = true;
        return card;
    }

    public returnCard(card: UnoCard): void
    {
        const index = this._activeCards.indexOf(card);
        if (index > -1)
        {
            this._activeCards.splice(index, 1);
            card.reset();
            this._availableCards.push(card);
        }
    }

    public returnAll(): void
    {
        while (this._activeCards.length > 0)
        {
            const card = this._activeCards.pop()!;
            card.reset();
            this._availableCards.push(card);
        }
    }
}
