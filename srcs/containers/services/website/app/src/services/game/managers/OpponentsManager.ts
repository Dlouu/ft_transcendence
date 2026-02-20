import { Container, Texture } from "pixi.js";
import { Hand, HandRotation } from "../domain/Hand";
import { Opponent } from "../domain/Opponent";
import { CardPool } from "../domain/CardPool";
import { AssetsManager } from "./AssetsManager";
import { UnoCard } from "../domain/UnoCard";
import { InitGameDto } from "../dto/init-game.dto";

export class OpponentsManager extends Container
{
    private _opponents: Map<number, Opponent> = new Map();
    private _cardPool: CardPool;
    private _assetsManager: AssetsManager;

    private _positions: Map<string, { rotation: HandRotation }> = new Map([
        ['left', { rotation: HandRotation.Left }],
        ['top', { rotation: HandRotation.Top }],
        ['right', { rotation: HandRotation.Right }]
    ]);

    constructor(
        cardPool: CardPool,
        assetsManager: AssetsManager
    )
    {
        super();
        this._cardPool = cardPool;
        this._assetsManager = assetsManager;
    }

    public initializeOpponents(
        initGameDto: InitGameDto
    ): void
    {
        const totalPlayers = initGameDto.players.length;
        const myIndex = initGameDto.playerIndex;

        for (let i = 0; i < totalPlayers; i++)
        {
            if (i === myIndex) continue;

            const relativeIndex = (i - myIndex + totalPlayers) % totalPlayers;
            let positionKey = '';
            
            if (totalPlayers === 2)
            {
                positionKey = 'top'; 
            }
            else if (totalPlayers === 3)
            {
                if (relativeIndex === 1) positionKey = 'right';
                if (relativeIndex === 2) positionKey = 'left';
            }
            else
            {
                if (relativeIndex === 1) positionKey = 'right';
                if (relativeIndex === 2) positionKey = 'top';
                if (relativeIndex === 3) positionKey = 'left';
            }

            const player = initGameDto.players[i];
            this.createOpponent(
                i,
                player.name,
                positionKey,
                initGameDto.startCardNbr,
                player.cardBack
            );
        }
    }

    private createOpponent(
        index: number,
        name: string,
        positionKey: string,
        cardCount: number,
        cardBackVariant: string,
    ): void
    {
        const config = this._positions.get(positionKey);
        if (!config) return;

        const hand = new Hand(
            0.7, 
            0.4, 
            0.66, 
            config.rotation,
            false
        );

        this.addChild(hand);
        
        const cardBack = this._assetsManager.getCardBack(cardBackVariant);
        const opponent = new Opponent(name, index, hand, cardBack);
        
        opponent.initializeHand(cardCount, this._cardPool);

        this._opponents.set(index, opponent);
        (hand as any)._layoutPosition = positionKey; 
    }

    public resize(width: number, height: number): void
    {
        this._opponents.forEach((opp) => {
            const hand = opp.hand;
            const posKey = (hand as any)._layoutPosition;

            if (posKey === 'top')
            {
                hand.position.set(width / 2, height * 0.125);
            }
            else if (posKey === 'left')
            {
                hand.position.set(width * 0.07, height / 2);
            }
            else if (posKey === 'right')
            {
                hand.position.set(width * 0.93, height / 2);
            }

            hand.resize(width, height);
            hand.setVisible(true);
        });
    }

    public destroy(): void
    {
        this._opponents.forEach((opp) => {
            if (opp.hand.parent)
            {
                opp.hand.parent.removeChild(opp.hand);
            }
            
            const cards = [...opp.hand.children];
            cards.forEach((c) => {
                if (c instanceof UnoCard) 
                {
                   opp.hand.removeCard(c);
                   this._cardPool.returnCard(c);
                }
            });
            
            opp.destroy();
        });
        this._opponents.clear();
    }
}
