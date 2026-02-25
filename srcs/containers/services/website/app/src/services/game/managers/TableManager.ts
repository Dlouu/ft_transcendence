import { CardDto } from "../dto/card.dto"; 
import { Container, Graphics, Sprite, Texture } from "pixi.js";
import { Hand } from "../domain/Hand";
import { CardPile } from "../domain/CardPile";
import { OpponentsManager } from "./OpponentsManager";
import { CardPool } from "../domain/CardPool";
import { AssetsManager } from "./AssetsManager";
import { Card, UnoCard } from "../domain/UnoCard";
import { InitGameDto } from "../dto/init-game.dto";
import { CardFamily, HandRotation } from "../domain/GameEnums";
import { CardFamilySelector, SelectableCardFamily } from "./CardFamilySelector";

export class TableManager extends Container
{
    private static readonly PILES_BACKDROP_WIDTH_RATIO: number = 0.35;
    private static readonly PILES_BACKDROP_ASPECT_RATIO: number = 8 / 16;
    private static readonly PILES_BACKDROP_BORDER_DARKEN: number = 0.12;
    private static readonly DEFAULT_PILES_BACKDROP_COLORS: Record<CardFamily, string> = {
        [CardFamily.ONE]: "#2c7fe5",
        [CardFamily.TWO]: "#26cd00",
        [CardFamily.THREE]: "#ff1249",
        [CardFamily.FOUR]: "#ffc412",
        [CardFamily.WILD]: "#9a9a9a",
    };

    private _playerHand: Hand;
    private _deck: CardPile;
    private _discard: CardPile;
    private _opponentsManager: OpponentsManager;
    private _playerIndex: number = -1;
    private _pilesBackdrop: Graphics;
    private _middleArrow: Sprite;
    private _pilesBackdropColor: string = "#3e295d";
    private _tableWidth: number = 0;
    private _tableHeight: number = 0;
    private _middleArrowYRatio: number = 0.43;
    private _middleArrowSizeRatio: number = 0.08;
    private _isMiddleArrowMirrored: boolean = false;
    private _cardFamilySelector: CardFamilySelector | null = null;
    private _pilesBackdropColors: Record<CardFamily, string> = {
        ...TableManager.DEFAULT_PILES_BACKDROP_COLORS,
    };

    private _cardPool: CardPool;
    private _assetsManager: AssetsManager;

    constructor(
        cardPool: CardPool,
        assetsManager: AssetsManager,
        onPlayerCardClick?: (card: UnoCard) => void,
        onDeckClick?: () => void,
    )
    {
        super();

        this._cardPool = cardPool;
        this._assetsManager = assetsManager;

        this._deck = new CardPile(null, true, true, onDeckClick);
        this._discard = new CardPile(null, true, false);
        this._pilesBackdrop = new Graphics();
        this._middleArrow = new Sprite(this._assetsManager.arrowTexture);
        this._middleArrow.anchor.set(0.5);

        this._playerHand = new Hand(
            0.7,
            0.4,
            0.66,
            HandRotation.Bottom,
            true,
            false,
            false,
            onPlayerCardClick
        );

        this._opponentsManager = new OpponentsManager(
            cardPool,
            assetsManager
        );

        this.addChild(this._opponentsManager);
        this.addChild(this._pilesBackdrop);
        this.addChild(this._middleArrow);
        this.addChild(this._deck);
        this.addChild(this._discard);
        this.addChild(this._playerHand);
    }

    public initializeGame(initGameDto: InitGameDto): void
    {
        this._playerIndex = initGameDto.playerIndex;

        this.initializePilesBackdropColors(
            this._assetsManager.getThemeBackdropColors()
        );

        this._opponentsManager.initializeOpponents(initGameDto);

        this.setupPlayerHand(initGameDto);

        this.setupPiles(initGameDto);

        this._playerHand.setVisible(true);
        this._deck.setVisible(true);
        this._discard.setVisible(true);
        this._pilesBackdrop.visible = true;
        this.hideCardFamilySelector();

        this.setActivePlayer(initGameDto.firstPlayerIndex);
    }

    public showCardFamilySelector(onSelect: (cardFamily: SelectableCardFamily) => void): void
    {
        this.hideCardFamilySelector();

        this._cardFamilySelector = new CardFamilySelector(
            {
                [CardFamily.ONE]: this._pilesBackdropColors[CardFamily.ONE],
                [CardFamily.TWO]: this._pilesBackdropColors[CardFamily.TWO],
                [CardFamily.THREE]: this._pilesBackdropColors[CardFamily.THREE],
                [CardFamily.FOUR]: this._pilesBackdropColors[CardFamily.FOUR],
            },
            Math.min(this._tableWidth, this._tableHeight) * 0.18,
            (cardFamily) => {
                onSelect(cardFamily);
                this.hideCardFamilySelector();
            }
        );

        this._cardFamilySelector.position.set(this._tableWidth / 2, this._tableHeight / 2);
        this.addChild(this._cardFamilySelector);
    }

    public hideCardFamilySelector(): void
    {
        if (!this._cardFamilySelector)
        {
            return;
        }

        this._cardFamilySelector.destroy({ children: true });
        this._cardFamilySelector = null;
    }

    public setActivePlayer(playerIndex: number): void
    {
        const isLocalPlayerTurn = playerIndex === this._playerIndex;
        this._playerHand.setTurnActive(isLocalPlayerTurn);
        this._opponentsManager.setActivePlayer(playerIndex);
    }

    public removePlayerCard(cardIndex: number): void
    {
        const removedCard = this._playerHand.removeCardAt(cardIndex);
        if (!removedCard)
        {
            return;
        }

        this._cardPool.returnCard(removedCard);
    }

    public addPlayerCard(cardDto: CardDto | undefined): void
    {
        if (!cardDto)
            return ;

        const card = this._cardPool.getCard();
        const cardModel = new Card(cardDto.cardFamily, cardDto.cardCode);
        const texture = this._assetsManager.getCardTexture(
            cardDto.cardFamily,
            cardDto.cardCode
        );

        card.setFaceUpCard(texture, cardModel);
        this._playerHand.addCard(card);
    }

    public removeOpponentCard(playerName: string, cardIndex: number): void
    {
        const removedCard = this._opponentsManager.removeOpponentCard(playerName, cardIndex);
        if (!removedCard)
        {
            return;
        }

        this._cardPool.returnCard(removedCard);
    }

    public addOpponentCard(playerName: string): void
    {
        this._opponentsManager.addOpponentCard(playerName);
    }

    public updateDiscardCard(cardDto: CardDto): void
    {
        const oldCard = this._discard.card;
        if (oldCard)
        {
            this._discard.setCard(null);
            this._cardPool.returnCard(oldCard);
        }

        const newDiscardCard = this._cardPool.getCard();
        const discardCardModel = new Card(cardDto.cardFamily, cardDto.cardCode);
        const texture = this._assetsManager.getCardTexture(
            cardDto.cardFamily,
            cardDto.cardCode
        );
        newDiscardCard.setFaceUpCard(texture, discardCardModel);
        this._discard.setCard(newDiscardCard);

        this.setPilesBackdropColorByCardSet(cardDto.cardFamily);
    }

    public resize(width: number, height: number): void
    {
        this._tableWidth = width;
        this._tableHeight = height;

        this.updateMiddleArrow(width, height);

        this._playerHand.position.set(width / 2, height * 0.875);
        this._playerHand.resize(width, height);

        this._opponentsManager.resize(width, height);

        this.updatePilesBackdrop(width, height);

        const pilesOffset = width / 9;

        this._deck.position.set(width / 2 - pilesOffset, height / 2);
        this._deck.resize(width, height);

        this._discard.position.set(width / 2 + pilesOffset, height / 2);
        this._discard.resize(width, height);

        if (this._cardFamilySelector)
        {
            this._cardFamilySelector.position.set(width / 2, height / 2);
        }
    }

    private updateMiddleArrow(width: number, height: number): void
    {
        if (this._middleArrow.texture === Texture.EMPTY)
        {
            this._middleArrow.texture = this._assetsManager.arrowTexture;
        }

        const size = Math.min(width, height) * this._middleArrowSizeRatio;

        this._middleArrow.position.set(width / 2, height * this._middleArrowYRatio);
        this._middleArrow.width = size;
        this._middleArrow.height = size;
        this._middleArrow.scale.x = Math.abs(this._middleArrow.scale.x) * (this._isMiddleArrowMirrored ? -1 : 1);
    }

    public mirrorMiddleArrow(): void
    {
        this._isMiddleArrowMirrored = !this._isMiddleArrowMirrored;
        this._middleArrow.scale.x = Math.abs(this._middleArrow.scale.x) * (this._isMiddleArrowMirrored ? -1 : 1);
    }

    public setPilesBackdropColorByCardSet(cardFamily: CardFamily): void
    {
        console.log(`New color : ${cardFamily}`);
        const color = this._pilesBackdropColors[cardFamily] ?? "#9a9a9a";
        this.setPilesBackdropColor(color);
    }

    public initializePilesBackdropColors(colors: Partial<Record<CardFamily, string>>): void
    {
        this._pilesBackdropColors = {
            ...TableManager.DEFAULT_PILES_BACKDROP_COLORS,
            ...colors,
        };
    }

    public setPilesBackdropGrey(): void
    {
        this.setPilesBackdropColor("#9a9a9a");
    }

    private setupPlayerHand(dto: InitGameDto): void
    {
        for (const cardData of dto.playerHand)
        {
            const card = this._cardPool.getCard();
            const cardModel = new Card(cardData.cardFamily, cardData.cardCode);
            const texture = this._assetsManager.getCardTexture(
                cardData.cardFamily,
                cardData.cardCode
            );

            card.setFaceUpCard(texture, cardModel);
            this._playerHand.addCard(card);
        }
    }

    private setupPiles(dto: InitGameDto): void
    {
        const deckCard = this._cardPool.getCard();
        deckCard.setFaceBackCard(this._assetsManager.getCardBack(dto.players[dto.playerIndex].cardBack), null);
        this._deck.setCard(deckCard);

        const discardCard = this._cardPool.getCard();
        const discardCardModel = new Card(dto.discardTopCard.cardFamily, dto.discardTopCard.cardCode);
        const texture = this._assetsManager.getCardTexture(
            dto.discardTopCard.cardFamily,
            dto.discardTopCard.cardCode
        );
        discardCard.setFaceUpCard(texture, discardCardModel);
        this._discard.setCard(discardCard);

        this.setPilesBackdropColorByCardSet(dto.discardTopCard.cardFamily);
    }

    private setPilesBackdropColor(color: string): void
    {
        if (this._pilesBackdropColor === color)
        {
            return;
        }

        this._pilesBackdropColor = color;

        if (this._tableWidth > 0 && this._tableHeight > 0)
        {
            this.updatePilesBackdrop(this._tableWidth, this._tableHeight);
        }
    }

    private updatePilesBackdrop(width: number, height: number): void
    {
        if (width <= 0 || height <= 0)
        {
            return;
        }

        const rectWidth = width * TableManager.PILES_BACKDROP_WIDTH_RATIO;
        const rectHeight = rectWidth * TableManager.PILES_BACKDROP_ASPECT_RATIO;
        const fillColor = this.parseHexColor(this._pilesBackdropColor);
        const borderColor = this.darkenColor(
            fillColor,
            TableManager.PILES_BACKDROP_BORDER_DARKEN
        );
        const radius = Math.min(rectWidth, rectHeight) * 0.12;

        this._pilesBackdrop.clear();
        this._pilesBackdrop.lineStyle(2, borderColor, 1);
        this._pilesBackdrop.beginFill(fillColor, 1);
        this._pilesBackdrop.drawRoundedRect(
            -rectWidth / 2,
            -rectHeight / 2,
            rectWidth,
            rectHeight,
            radius
        );
        this._pilesBackdrop.endFill();
        this._pilesBackdrop.position.set(width / 2, height / 2);
    }

    private darkenColor(color: number, amount: number): number
    {
        const r = (color >> 16) & 0xff;
        const g = (color >> 8) & 0xff;
        const b = color & 0xff;

        const darken = (value: number) => Math.max(0, Math.round(value * (1 - amount)));

        return (darken(r) << 16) + (darken(g) << 8) + darken(b);
    }

    private parseHexColor(color: string): number
    {
        if (color.startsWith("#"))
        {
            return parseInt(color.slice(1), 16);
        }

        if (color.startsWith("0x"))
        {
            return parseInt(color.slice(2), 16);
        }

        return parseInt(color, 16);
    }

    public destroy(): void
    {
        this.hideCardFamilySelector();
        this.cleanupHand(this._playerHand);
        this.cleanupPile(this._deck);
        this.cleanupPile(this._discard);

        this._opponentsManager.destroy();

        if (this.parent)
        {
            this.parent.removeChild(this);
        }
        
        super.destroy({ children: true });
    }

    private cleanupHand(hand: Hand): void
    {
        const cards = hand.children.filter(
            (c) => c instanceof UnoCard
        ) as UnoCard[];
        
        cards.forEach((c) => {
            hand.removeCard(c);
            this._cardPool.returnCard(c);
        });
    }

    private cleanupPile(pile: CardPile): void
    {
        const card = pile.card;
        if (card)
        {
            pile.setCard(null);
            this._cardPool.returnCard(card);
        }
    }
}
