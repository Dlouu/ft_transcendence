import { Container } from 'pixi.js';
import { UnoCard } from './UnoCard';

export enum HandRotation
{
    DEG_0 = 0,      // Bottom Player (Horizontal)
    DEG_90 = 90,    // Right Opponent (Vertical)
    DEG_180 = 180,  // Top Opponent (Horizontal)
    DEG_270 = 270   // Left Opponent (Vertical)
}

export class Hand extends Container
{
    private _cards: UnoCard[] = [];
    
    // Config
    /** Percentage of the canvas dimension (width or height) available for the hand to layout cards. */
    private _areaPercent: number;
    
    /** Percentage of a card's width that should be overlapped by the next card. */
    private _overlapPercent: number;
    
    /** Aspect ratio (width / height) used to maintain card proportions during resizing. */
    private _cardRatio: number;
    
    /** Current rotation state of the hand, determining its position on the table (e.g., DEG_0 for bottom player). */
    private _rotationEnum: HandRotation;

    // Dimensions
    /** The current width of the rendering area/canvas. */
    private _canvasWidth: number = 0;
    
    /** The current height of the rendering area/canvas. */
    private _canvasHeight: number = 0;
    
    private _isVisible: boolean = true;

    constructor(
        areaPercent: number = 0.6,
        overlapPercent: number = 0.5,
        cardRatio: number = 0.66,
        rotation: HandRotation = HandRotation.DEG_0
    )
    {
        super();
        this._areaPercent = areaPercent;
        this._overlapPercent = overlapPercent;
        this._cardRatio = cardRatio;
        this._rotationEnum = rotation;

        this.angle = rotation;
    }

    public addCard(card: UnoCard): void
    {
        this._cards.push(card);
        this.addChild(card);
        this.updateLayout();
    }

    public removeCard(card: UnoCard): void
    {
        const index = this._cards.indexOf(card);
        if (index > -1)
        {
            this._cards.splice(index, 1);
            this.removeChild(card);
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
        this._rotationEnum = rotation;
        this.angle = rotation;
        this.updateLayout();
    }

    public setVisible(visible: boolean): void
    {
        this._isVisible = visible;
        this.refreshVisibility();
    }

    public refreshVisibility(): void
    {
        this.visible = this._isVisible;
    }

    private updateLayout(): void
    {
        if (this._cards.length === 0 || this._canvasWidth === 0) return;

        const count = this._cards.length;
        const isVertical = (this._rotationEnum === HandRotation.DEG_90 || this._rotationEnum === HandRotation.DEG_270);

        let handLengthAvailable = 0;
        let maxCardThickness = 0;

		// handLengthAvailable = this._canvasHeight * this._areaPercent;
		// maxCardThickness = this._canvasWidth * 0.15; 
		handLengthAvailable = this._canvasWidth * this._areaPercent;
		maxCardThickness = this._canvasHeight * 0.20;

        let cardWidth = 0;
        let cardHeight = 0;

        if (isVertical)
        {
            cardHeight = maxCardThickness;
            cardWidth = cardHeight * this._cardRatio;
        }
        else
        {
            cardHeight = maxCardThickness;
            cardWidth = cardHeight * this._cardRatio;
        }

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

        for (let i = 0; i < count; i++)
        {
            const card = this._cards[i];

            card.width = cardWidth;
            card.height = cardHeight;
            card.rotation = 0; 
            card.x = startOffset + (step * i);
            card.y = 0; 
            card.zIndex = i;

            // --- SHADOW ADJUSTMENT ---
            // We want the shadow to fall on the PREVIOUS card (index i-1).
            // Since cards are stacked i on top of i-1, and 'step' moves +X (Right),
            // we must cast the shadow to -X (Left) to hit the card underneath.
            
            // Adjust scale of offset based on card size so it looks proportional
            const shadowX = -(cardWidth * 0.05); // Negative X for left projection
            const shadowY = cardHeight * 0.05;   // Positive Y for down projection
            
            card.setShadowOffset(shadowX, shadowY);
        }
        
        this.sortChildren();
    }
}
