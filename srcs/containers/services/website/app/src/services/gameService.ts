import { Application, Assets, Graphics, Sprite, Texture } from 'pixi.js';
import { Hand, HandRotation } from './game/Hand';
import { CardPool } from './game/CardPool';
import { AssetsManager, CardSet, CardsTheme, CardValue } from './game/AssetsManager';

interface IGameInitOptions
{
    canvas: HTMLCanvasElement;
}

export class GameService
{
    private app: Application | null = null;

    private _isInitialized: boolean = false;

    private _playerHand: Hand = new Hand(0.7, 0.4, 0.66, HandRotation.DEG_0);
    private _topOppHand: Hand = new Hand(0.7, 0.4, 0.66, HandRotation.DEG_180);
    private _leftOppHand: Hand = new Hand(0.7, 0.4, 0.66, HandRotation.DEG_90);
    private _rightOppHand: Hand = new Hand(0.7, 0.4, 0.66, HandRotation.DEG_270);

    private _cardPool!: CardPool;
    private _assetsMangr!: AssetsManager;

    constructor()
    {
        this.app = null;
        this._isInitialized = false;
    }

    /**
     * Initializes the Pixi Application with the canvas provided by React.
     */
    public async init({ canvas }: IGameInitOptions): Promise<void>
    {
        if (!canvas)
        {
            throw new Error("GameService.init: canvas is required");
        }

        this.app = new Application();

        await this.app.init(
        {
            canvas: canvas,
            width: canvas.clientWidth,
            height: canvas.clientHeight,
            backgroundColor: "#2b2b2b",
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            antialias: true
        });

        this._assetsMangr = new AssetsManager();

        this._cardPool = new CardPool(this.app.stage);

        await this._assetsMangr.loadTheme(CardsTheme.Uwu);
        await this._assetsMangr.loadCardBacks(["uwu"]);

        this._cardPool = new CardPool(this.app.stage);

        this.app.stage.addChild(this._playerHand, 
                                this._topOppHand,
                                this._leftOppHand,
                                this._rightOppHand);

        this._isInitialized = true;

        this.onResize(canvas.clientWidth, canvas.clientHeight);

        this.start();
    }

    /**
     * Setup the game scene (add sprites, logic, etc.)
     */
    public start(): void
    {
        if (!this.app || !this._isInitialized) return;

        // Example: Add a simple "Card" to the stage
        // this.drawExampleCardFromSprite();

        // TO DELETE, JUST FOR TEST
        for (let i = 0; i < 7; i++) {
            const upCard = this._cardPool.getCard();
            const dowTopCard = this._cardPool.getCard();
            const dowLeftCard = this._cardPool.getCard();
            const dowRightCard = this._cardPool.getCard();
            upCard.setFaceUpCard(this._assetsMangr.getCardTexture(CardSet.One, CardValue.One), true);
            dowTopCard.setFaceBackCard(this._assetsMangr.getCardBack('uwu'), true);
            dowLeftCard.setFaceBackCard(this._assetsMangr.getCardBack('uwu'), true);
            dowRightCard.setFaceBackCard(this._assetsMangr.getCardBack('uwu'), true);
            this._playerHand.addCard(upCard);
            this._topOppHand.addCard(dowTopCard);
            this._leftOppHand.addCard(dowLeftCard);
            this._rightOppHand.addCard(dowRightCard);
        }

        // Pixi handles the loop automatically via app.ticker
        // You can add your own update logic here:
        this.app.ticker.add((ticker) =>
        {
            this.update(ticker.deltaTime);
        });
    }

    /**
     * Main Game Loop
     * @param _dt Delta time from Pixi Ticker
     */
    private update(_dt: number): void
    {
        // Add your game logic here
        // Example: socket.emit('playerMove', ...)
    }

    // private async drawExampleCardFromSprite(): Promise<void>
    // {
    //     if (!this.app) return;
    //     // Create a card graphic
    //     const card = new Sprite(this._textures[0]);

    //     // Position in center
    //     card.x = this.app.screen.width / 2 - 50;
    //     card.y = this.app.screen.height / 2 - 75;

    //     // Add to stage
    //     this.app.stage.addChild(card);
    // }

    /**
     * Handle window resizing.
     * Called from the React component.
     */
    public onResize(width: number, height: number): void
    {
        if (!this.app || !this._isInitialized) return;

        console.log("Width : " + width + " | Height : " + height)

        // this.app.renderer.resize(width, height);

        const w = this.app.screen.width;
        const h = this.app.screen.height;

        // 1. Player Hand: Positioned at Bottom Center
        this._playerHand.position.set(w / 2, h * 0.875); 
        this._playerHand.resize(w, h);
        this._playerHand.setVisible(true);

        // 2. Top Opponent: Positioned at Top Center
        this._topOppHand.position.set(w / 2, h * 0.125);
        this._topOppHand.resize(w, h);
        this._topOppHand.setVisible(true);

        // 3. Left Opponent: Positioned at Left Center
        this._leftOppHand.position.set(w * 0.09, h / 2);
        this._leftOppHand.resize(w, h);
        this._leftOppHand.setVisible(true);

        // 4. Right Opponent: Positioned at Right Center
        this._rightOppHand.position.set(w * 0.91, h / 2);
        this._rightOppHand.resize(w, h);
        this._rightOppHand.setVisible(true);
    }

    /**
     * Cleanup when the React component unmounts
     */
    public destroy(): void
    {
        if (this.app)
        {
            this.app.destroy({ removeView: false }, { children: true });
            this.app = null;
        }
        
        this._isInitialized = false;
    }
}

export const gameService = new GameService();
