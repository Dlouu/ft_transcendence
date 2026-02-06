import { Application, Assets, Graphics, Sprite, Text, TextStyle, Texture } from 'pixi.js';
import uwuBack from '../gallery/UwU-back.png';

interface IGameInitOptions
{
    canvas: HTMLCanvasElement;
}

export class GameService
{
    private app: Application | null = null;

    private isInitialized: boolean = false;

    private theme: any | null = null;
    private texture: any | null = null;

    constructor()
    {
        this.app = null;
        this.isInitialized = false;
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

        this.isInitialized = true;

        this.start();
    }

    private async preloadGameAssets(): Promise<void>
    {

    }

    /**
     * Setup the game scene (add sprites, logic, etc.)
     */
    public start(): void
    {
        if (!this.app || !this.isInitialized) return;

        // Example: Add a simple "Card" to the stage
        this.drawExampleCardFromSprite();

        // Pixi handles the loop automatically via app.ticker
        // You can add your own update logic here:
        this.app.ticker.add((ticker) =>
        {
            this.update(ticker.deltaTime);
        });
    }

    /**
     * Main Game Loop
     * @param dt Delta time from Pixi Ticker
     */
    private update(dt: number): void
    {
        // Add your game logic here
        // Example: socket.emit('playerMove', ...)
    }

    /**
     * Example function to draw something using Pixi
     */
    private drawExampleCard(): void
    {
        if (!this.app) return;

        // Create a card graphic
        const card = new Graphics();
        
        // Draw Card Body (Yellow)
        card.roundRect(0, 0, 100, 150, 10);
        card.fill("#4A4A4A"); // Gold/Yellow
        
        // Add a border
        card.stroke({ width: 4, color: 0xFFFFFF });

        // Position in center
        card.x = this.app.screen.width / 2 - 50;
        card.y = this.app.screen.height / 2 - 75;

        // Add to stage
        this.app.stage.addChild(card);
    }

    private async drawExampleCardFromSprite(): Promise<void>
    {
        if (!this.app) return;
        // Create a card graphic
        const card = new Sprite(this.texture);

        // Position in center
        card.x = this.app.screen.width / 2 - 50;
        card.y = this.app.screen.height / 2 - 75;

        // Add to stage
        this.app.stage.addChild(card);
    }

    /**
     * Handle window resizing.
     * Called from the React component.
     */
    public onResize(width: number, height: number): void
    {
        if (!this.app || !this.isInitialized) return;

        console.log("Width : " + width + " | Height : " + height)

        // Tell Pixi renderer to resize
        this.app.renderer.resize(width, height);

        // Optional: Re-center elements after resize
        // this.recalculateLayout();
    }

    /**
     * Cleanup when the React component unmounts
     */
    public destroy(): void
    {
        if (this.app)
        {
            // Destroy the application, but KEEP the canvas (false)
            // because React controls the DOM element.
            this.app.destroy({ removeView: false }, { children: true });
            this.app = null;
        }
        
        this.isInitialized = false;
    }
}

export const gameService = new GameService();
