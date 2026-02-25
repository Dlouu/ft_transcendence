import { UnoCard } from './UnoCard';
import { Container, Rectangle, Graphics } from 'pixi.js';
import { HandRotation } from './GameEnums';

export class Hand extends Container
{
    private _cards: UnoCard[] = [];
    private _hoveredCard: UnoCard | null = null;
    private _underlay: Graphics;
    private _onCardClick?: (card: UnoCard) => void;
    private _isTurnActive: boolean = false;

    // Config
    private _areaPercent: number;
    private _overlapPercent: number;
    private _cardRatio: number;
    private _isInteractive: boolean;
    private _reverseCards: boolean;

    // Responsiveness
    private _hoverJumpPercent: number = 0.25;
    private _hoverSpreadPercent: number = 0.40;

    // Dimensions
    private _canvasWidth: number = 0;
    private _canvasHeight: number = 0;

    constructor(
        areaPercent: number = 0.6,
        overlapPercent: number = 0.3,
        cardRatio: number = 0.66,
        rotation: HandRotation = HandRotation.Bottom,
        isInteractive: boolean = false,
        reverseCards: boolean = false,
        isVisible: boolean = true,
        onCardClick?: (card: UnoCard) => void
    )
    {
        super();
        this._areaPercent = areaPercent;
        this._overlapPercent = overlapPercent;
        this._cardRatio = cardRatio;
        this._isInteractive = isInteractive;
        this._reverseCards = reverseCards;
        this._onCardClick = onCardClick;
        this.visible = isVisible;
        
        this.sortableChildren = true;
        this.angle = rotation;

        // Initialize Underlay
        this._underlay = new Graphics();
        this._underlay.zIndex = -1000; // Ensure it stays behind cards
        this.addChild(this._underlay);
    }

    public addCard(card: UnoCard): void
    {
        this._cards.push(card);
        this.addChild(card);
        
        if (this._isInteractive)
        {
            card.eventMode = 'static';
            card.cursor = 'pointer';
            card.on('pointerenter', () => this.onCardHover(card));
            card.on('pointerleave', () => this.onCardOut(card));
            card.on('pointertap', () => this.onCardClick(card));
        }

        this.updateLayout();
    }

    public removeCard(card: UnoCard): void
    {
        const index = this._cards.indexOf(card);
        if (index > -1)
        {
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

    public removeCardAt(index: number): UnoCard | null
    {
        if (index < 0 || index >= this._cards.length)
        {
            return null;
        }

        const card = this._cards[index];
        this.removeCard(card);
        return card;
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

    private onCardClick(card: UnoCard): void
    {
        this._onCardClick?.(card);
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

    public setTurnActive(active: boolean): void
    {
        if (this._isTurnActive === active)
        {
            return;
        }

        this._isTurnActive = active;
        this.updateLayout();
    }

    private updateLayout(): void
    {
        if (this._canvasWidth === 0) return;

        const count = this._cards.length;
        const isVertical = (Math.abs(this.angle) === 90 || Math.abs(this.angle) === 270);

        // --- 1. Calculate Card Size ---
        const maxCardThickness = this._canvasHeight * 0.20;
        const cardHeight = maxCardThickness;
        const cardWidth = cardHeight * this._cardRatio;

        // --- 2. Calculate Available Spread Space ---
        const screenLengthAvailable = isVertical ? this._canvasHeight : this._canvasWidth;
        const handLengthAvailable = screenLengthAvailable * this._areaPercent;

        // --- Update Underlay ---
        // We draw an ellipse. To make it closer to the edge, we shift the center 
        // positive Y (downwards in local space), so the arc sits lower.
        const underlayYOffset = cardHeight * 0.9;

        this._underlay.clear();
        this._underlay.ellipse(0, underlayYOffset, handLengthAvailable / 2, cardHeight * 1.25);

        if (this._isTurnActive)
        {
            this._underlay.fill({ color: 0xffffff, alpha: 0.35 });
            this._underlay.stroke({ color: 0xffffff, alpha: 0.8, width: Math.max(2, cardHeight * 0.035) });
        }
        else
        {
            this._underlay.fill({ color: 0x000000, alpha: 0.25 });
        }

        if (count === 0) return;

        // --- 3. Spacing Logic ---
        const hoverSpread = cardWidth * this._hoverSpreadPercent;
        const hoveredIndex = this._hoveredCard ? this._cards.indexOf(this._hoveredCard) : -1;
        
        let spreadAmount = 0;
        if (hoveredIndex !== -1)
        {
            if (hoveredIndex > 0) spreadAmount += hoverSpread;
            if (hoveredIndex < count - 1) spreadAmount += hoverSpread;
        }

        const maxSpan = handLengthAvailable - cardWidth;
        const normalStep = cardWidth * (1 - this._overlapPercent);
        const idealSpan = (count - 1) * normalStep + spreadAmount;

        let step = 0;
        let actualSpan = 0;

        if (idealSpan <= maxSpan)
        {
            step = normalStep;
            actualSpan = idealSpan;
        }
        else
        {
            actualSpan = maxSpan;
            if (count > 1)
            {
                step = Math.max(0, (maxSpan - spreadAmount) / (count - 1));
            }
        }

        let currentX = -actualSpan / 2;
        const jumpOffset = -(cardHeight * this._hoverJumpPercent);

        for (let i = 0; i < count; i++)
        {
            const card = this._cards[i];

            card.width = cardWidth;
            card.height = cardHeight;
            card.rotation = this._reverseCards ? Math.PI : 0;

            // --- Layout Logic ---
            let nextGap = step;
            if (hoveredIndex !== -1)
            {
                if (i === hoveredIndex - 1) nextGap += hoverSpread;
                else if (i === hoveredIndex) nextGap += hoverSpread;
            }

            card.x = currentX;

            const isHovered = (card === this._hoveredCard);
            const yOffset = isHovered ? jumpOffset : 0;
            
            card.y = yOffset;
            card.zIndex = isHovered ? count + 1 : i;

            // --- Hit Area Calculation ---
            const bounds = card.getLocalBounds();
            const scaleX = card.scale.x || 1; 
            const scaleY = card.scale.y || 1;

            const distToNext = (i === count - 1) ? cardWidth : nextGap;
            const screenHitWidth = Math.min(cardWidth, distToNext);

            const localHitWidth = screenHitWidth / scaleX;
            const localYOffset = -yOffset / scaleY;

            card.hitArea = new Rectangle(
                bounds.x,
                bounds.y + localYOffset,
                localHitWidth,
                bounds.height
            );

            currentX += nextGap;
        }

        this.sortChildren();
    }
}
