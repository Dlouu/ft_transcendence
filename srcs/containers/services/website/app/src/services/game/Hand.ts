import { UnoCard } from './UnoCard';
import { Container } from 'pixi.js';

export enum HandRotation
{
    Bottom = 0,
    Left = 90,
    Top = 180,
    Right = 270
}

export class Hand extends Container
{
    private _cards: UnoCard[] = [];
    private _hoveredCard: UnoCard | null = null;

    // Config
    private _areaPercent: number;
    private _overlapPercent: number;
    private _cardRatio: number;
    private _isInteractive: boolean; // Only the player's hand should be interactive

    // Responsiveness
    private _hoverJumpPercent: number = 0.25; // Card moves up by 25% of its height
    private _hoverSpreadPercent: number = 0.20; // Adjacent cards move away by 20% of card width

    // Dimensions
    private _canvasWidth: number = 0;
    private _canvasHeight: number = 0;

    constructor(
        areaPercent: number = 0.6,
        overlapPercent: number = 0.3,
        cardRatio: number = 0.66,
        rotation: HandRotation = HandRotation.Bottom,
        isInteractive: boolean = false,
        isVisible: boolean = true
    )
    {
        super();
        this._areaPercent = areaPercent;
        this._overlapPercent = overlapPercent;
        this._cardRatio = cardRatio;
        this._isInteractive = isInteractive;
        this.visible = isVisible;
        
        // Ensure zIndex sorting works automatically
        this.sortableChildren = true;

        this.angle = rotation;
    }

    public addCard(card: UnoCard): void
    {
        this._cards.push(card);
        this.addChild(card);
        
        // Setup Interaction if this hand is interactive (the player's hand)
        if (this._isInteractive)
        {
            card.eventMode = 'static';
            card.cursor = 'pointer';

            // Use binding or arrow functions to preserve 'this' context
            card.on('pointerenter', () => this.onCardHover(card));
            card.on('pointerleave', () => this.onCardOut(card));
        }

        this.updateLayout();
    }

    public removeCard(card: UnoCard): void
    {
        const index = this._cards.indexOf(card);
        if (index > -1)
        {
            // Clean up listeners to prevent memory leaks
            if (this._isInteractive)
            {
                card.removeAllListeners();
                card.eventMode = 'none';
                card.cursor = 'default';
            }

            this._cards.splice(index, 1);
            this.removeChild(card);

            if (this._hoveredCard === card)
            {
                this._hoveredCard = null;
            }

            this.updateLayout();
        }
    }

    private onCardHover(card: UnoCard): void
    {
        if (this._hoveredCard !== card)
        {
            this._hoveredCard = card;
            this.updateLayout();
        }
    }

    private onCardOut(card: UnoCard): void
    {
        if (this._hoveredCard === card)
        {
            this._hoveredCard = null;
            this.updateLayout();
        }
    }

    public resize(width: number, height: number): void
    {
        this._canvasWidth = width;
        this._canvasHeight = height;
        this.updateLayout();
    }

    public setRotation(rotation: HandRotation): void
    {
        this.angle = rotation;
        this.updateLayout();
    }

    public setVisible(visible: boolean): void
    {
        this.visible = visible;
    }

    private updateLayout(): void
    {
        if (this._cards.length === 0 || this._canvasWidth === 0) return;

        const count = this._cards.length;

        // 1. Calculate Limits
        let handLengthAvailable = 0;
        let maxCardThickness = 0;

        handLengthAvailable = this._canvasWidth * this._areaPercent;
        maxCardThickness = this._canvasHeight * 0.20;

        // 2. Calculate Card Size
        let cardWidth = 0;
        let cardHeight = 0;

        cardHeight = maxCardThickness;
        cardWidth = cardHeight * this._cardRatio;

        // 3. Spacing Logic
        const visiblePercent = 1 - this._overlapPercent;
        const normalStep = cardWidth * visiblePercent;
        const fullSpanIfNeeded = cardWidth + (count - 1) * normalStep;

        let step = 0;
        let actualSpan = 0;

        if (fullSpanIfNeeded <= handLengthAvailable)
        {
            step = normalStep;
            actualSpan = fullSpanIfNeeded;
        }
        else
        {
            step = (handLengthAvailable - cardWidth) / (count - 1);
            actualSpan = handLengthAvailable;
        }

        const startOffset = -actualSpan / 2 + (cardWidth / 2);

        // 4. Calculate Jump and Spread (Responsive)
        // Move negative Y (up) relative to the hand container
        const jumpOffset = -(cardHeight * this._hoverJumpPercent);
        
        // Calculate the extra X spacing for cards adjacent to the hovered card
        const hoverSpread = cardWidth * this._hoverSpreadPercent;
        const hoveredIndex = this._hoveredCard ? this._cards.indexOf(this._hoveredCard) : -1;

        for (let i = 0; i < count; i++)
        {
            const card = this._cards[i];

            card.width = cardWidth;
            card.height = cardHeight;
            card.rotation = 0;

            // Base X Position
            let xPos = startOffset + (step * i);

            // Apply Hover Spread (X Position)
            if (hoveredIndex !== -1)
            {
                if (i < hoveredIndex)
                {
                    // Push left cards further left
                    xPos -= hoverSpread;
                }
                else if (i > hoveredIndex)
                {
                    // Push right cards further right
                    xPos += hoverSpread;
                }
                // The hovered card itself stays at its calculated center
            }

            card.x = xPos;

            // Y Position and Z-Index (Handling the Hover)
            if (card === this._hoveredCard)
            {
                card.y = jumpOffset;
                // If hovered, put it visually in front of its neighbors
                card.zIndex = count + 1;
            }
            else
            {
                card.y = 0;
                card.zIndex = i;
            }
        }

        this.sortChildren();
    }
}
