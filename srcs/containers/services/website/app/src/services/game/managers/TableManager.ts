import { Container } from "pixi.js";
import { Hand, HandRotation } from "../domain/Hand";
import { CardPile } from "../domain/CardPile";
import { OpponentsManager } from "./OpponentsManager";
import { CardPool } from "../domain/CardPool";
import { AssetsManager, CardSet, CardValue } from "./AssetsManager";
import { UnoCard } from "../domain/UnoCard";
import { InitGameDto } from "../dto/init-game.dto";

export class TableManager extends Container
{
    private _playerHand: Hand;
    private _deck: CardPile;
    private _discard: CardPile;
    private _opponentsManager: OpponentsManager;

    private _cardPool: CardPool;
    private _assetsManager: AssetsManager;

    constructor(
        cardPool: CardPool,
        assetsManager: AssetsManager
    )
    {
        super();

        this._cardPool = cardPool;
        this._assetsManager = assetsManager;

        this._deck = new CardPile(null, true, true);
        this._discard = new CardPile(null, true, false);

        this._playerHand = new Hand(
            0.7,
            0.4,
            0.66,
            HandRotation.Bottom,
            true,
            false
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
        this._opponentsManager.initializeOpponents(initGameDto);

        this.setupPlayerHand(initGameDto);

        this.setupPiles(initGameDto);

        this._playerHand.setVisible(true);
        this._deck.setVisible(true);
        this._discard.setVisible(true);
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
            const texture = this._assetsManager.getCardTexture(
                cardData.cardFamily as unknown as CardSet,
                cardData.cardCode as unknown as CardValue
            );

            card.setFaceUpCard(texture, true);
            this._playerHand.addCard(card);
        }
    }

    private setupPiles(dto: InitGameDto): void
    {
        const deckCard = this._cardPool.getCard();
        deckCard.setFaceBackCard(this._assetsManager.getCardBack(dto.cardTheme), true);
        this._deck.setCard(deckCard);

        const discardCard = this._cardPool.getCard();
        const texture = this._assetsManager.getCardTexture(
            dto.discardTopCard.cardFamily as unknown as CardSet,
            dto.discardTopCard.cardCode as unknown as CardValue
        );
        discardCard.setFaceUpCard(texture, true);
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
