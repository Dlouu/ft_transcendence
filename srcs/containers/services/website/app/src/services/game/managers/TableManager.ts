import { CardDto } from "../dto/card.dto"; 
import { Container } from "pixi.js";
import { Hand } from "../domain/Hand";
import { CardPile } from "../domain/CardPile";
import { OpponentsManager } from "./OpponentsManager";
import { CardPool } from "../domain/CardPool";
import { AssetsManager } from "./AssetsManager";
import { Card, UnoCard } from "../domain/UnoCard";
import { InitGameDto } from "../dto/init-game.dto";
import { HandRotation } from "../domain/GameEnums";

export class TableManager extends Container
{
    private _playerHand: Hand;
    private _deck: CardPile;
    private _discard: CardPile;
    private _opponentsManager: OpponentsManager;
    private _playerIndex: number = -1;

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

        this._playerHand = new Hand(
            0.7,
            0.4,
            0.66,
            HandRotation.Bottom,
            true,
            false,
            onPlayerCardClick
        );

        this._opponentsManager = new OpponentsManager(
            cardPool,
            assetsManager
        );

        this.addChild(this._opponentsManager);
        this.addChild(this._deck);
        this.addChild(this._discard);
        this.addChild(this._playerHand);
    }

    public initializeGame(initGameDto: InitGameDto): void
    {
        this._playerIndex = initGameDto.playerIndex;

        this._opponentsManager.initializeOpponents(initGameDto);

        this.setupPlayerHand(initGameDto);

        this.setupPiles(initGameDto);

        this._playerHand.setVisible(true);
        this._deck.setVisible(true);
        this._discard.setVisible(true);

        this.setActivePlayer(initGameDto.firstPlayerIndex);
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

        card.setFaceUpCard(texture, true, cardModel);
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
        newDiscardCard.setFaceUpCard(texture, true, discardCardModel);
        this._discard.setCard(newDiscardCard);
    }

    public resize(width: number, height: number): void
    {
        this._playerHand.position.set(width / 2, height * 0.875);
        this._playerHand.resize(width, height);

        this._opponentsManager.resize(width, height);

        const pilesOffset = width / 9;

        this._deck.position.set(width / 2 - pilesOffset, height / 2);
        this._deck.resize(width, height);

        this._discard.position.set(width / 2 + pilesOffset, height / 2);
        this._discard.resize(width, height);
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

            card.setFaceUpCard(texture, true, cardModel);
            this._playerHand.addCard(card);
        }
    }

    private setupPiles(dto: InitGameDto): void
    {
        const deckCard = this._cardPool.getCard();
        deckCard.setFaceBackCard(this._assetsManager.getCardBack(dto.players[dto.playerIndex].cardBack), true, null);
        this._deck.setCard(deckCard);

        const discardCard = this._cardPool.getCard();
        const discardCardModel = new Card(dto.discardTopCard.cardFamily, dto.discardTopCard.cardCode);
        const texture = this._assetsManager.getCardTexture(
            dto.discardTopCard.cardFamily,
            dto.discardTopCard.cardCode
        );
        discardCard.setFaceUpCard(texture, true, discardCardModel);
        this._discard.setCard(discardCard);
    }

    public destroy(): void
    {
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
