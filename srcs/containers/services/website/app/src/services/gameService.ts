import { Application } from "pixi.js";
import { io, Socket } from "socket.io-client";
import { Hand, HandRotation } from "./game/Hand";
import { UnoCard } from "./game/UnoCard";
import { CardPool } from "./game/CardPool";
import { AssetsManager, CardsTheme } from "./game/AssetsManager";
import { CardPile } from "./game/CardPile";

interface IGameInitOptions {
	canvas: HTMLCanvasElement;
	playerId: string;
}

export class GameService {
	private app: Application | null = null;
	private socket: Socket | null = null;

	private _isInitialized: boolean = false;
	private _hasGameStarted: boolean = false;
	private _pendingGameStart: boolean = false;

	private _playerHand: Hand = new Hand(
		0.7,
		0.4,
		0.66,
		HandRotation.Bottom,
		true,
	);
	private _topOppHand: Hand = new Hand(0.7, 0.4, 0.66, HandRotation.Top);
	private _leftOppHand: Hand = new Hand(0.7, 0.4, 0.66, HandRotation.Left);
	private _rightOppHand: Hand = new Hand(0.7, 0.4, 0.66, HandRotation.Right);

	private _deck: CardPile = new CardPile(null, true, true);
	private _discard: CardPile = new CardPile(null, true, false);

	private _cardPool!: CardPool;
	private _assetsMangr!: AssetsManager;

	constructor() {
		this.app = null;
		this._isInitialized = false;
		this._hasGameStarted = false;
		this._pendingGameStart = false;
	}

	public async init({ canvas, playerId }: IGameInitOptions): Promise<void> {
		if (!canvas) {
			throw new Error("GameService.init: canvas is required");
		}

		this.app = new Application();

		await this.app.init({
			canvas: canvas,
			width: canvas.clientWidth,
			height: canvas.clientHeight,
			backgroundColor: "#291c3d",
			// backgroundAlpha: 0.3,
			resolution: window.devicePixelRatio || 1,
			autoDensity: true,
			antialias: true,
		});

		this.initSocket(playerId);

		this._assetsMangr = new AssetsManager();

		await this._assetsMangr.loadTheme(CardsTheme.Uwu);
		await this._assetsMangr.loadCardBacks(["uwu"]);

		this._cardPool = new CardPool(this.app.stage);

		this.app.stage.addChild(
			this._playerHand,
			this._topOppHand,
			this._leftOppHand,
			this._rightOppHand,
			this._deck,
			this._discard,
		);

		this._isInitialized = true;

		this.onResize(canvas.clientWidth, canvas.clientHeight);
		
		this._tryStartGame();
	}

	public initSocket(playerId: string): void {
		const socketOptions = {
			query: {
				playerId: playerId,
			},
			transports: ["websocket"],
		};

		this.socket = io("http://localhost:3000", socketOptions);
		this.registerSocketListeners();
	}

	private registerSocketListeners(): void {
		if (!this.socket) return;

		this.socket.once("connect", () => {
			console.log("GameService: Socket connected", this.socket?.id);
		});

		this.socket.on("connect_error", (err) => {
			console.error("GameService: Connection error", err);
			window.location.href = "/";
		});

		this.socket.once("disconnect", (reason) => {
			if (reason === "io server disconnect") {
				window.location.href = "/";
			}
		});

		// Placeholder listeners for game events
		this.socket.once("game:start", (_payload) => {
			this._pendingGameStart = true;
			this._tryStartGame();
		});

		this.socket.once("game:join", (_payload) => {
			console.log(`You have joined ${_payload}`)
		});

		this.socket.once("game:rejoin", (_payload) => {
			console.log(`You have rejoined ${_payload}`)
		});

		this.socket.once("game:initHand", (_payload) => {
			console.log(`You got your initial hand : ${_payload}`)
		});

		this.socket.on("game:error", (payload) => {
			console.error("GameService: Game error", payload);
			this.socket?.disconnect();
			window.location.href = "/";
		});
	}

	private _tryStartGame(): void {
		if (!this._pendingGameStart || this._hasGameStarted || !this._isInitialized) {
			return;
		}

		this.start();
	}

	public start(): void {
		if (!this.app || !this._isInitialized || this._hasGameStarted) return;

		this._hasGameStarted = true;
		this._pendingGameStart = false;

		const deckCard = this._cardPool.getCard();
		deckCard.setFaceBackCard(this._assetsMangr.getCardBack("uwu"), true);
		this._deck.setCard(deckCard);

		// Pixi handles the loop automatically via app.ticker
		this.app.ticker.add((ticker) => {
			this.update(ticker.deltaTime);
		});
		console.log("Game started !");
	}

	/**
	 * Main Game Loop
	 * @param _dt Delta time from Pixi Ticker
	 */
	private update(_dt: number): void {
		// Add your game logic here
		// Example: socket.emit('playerMove', ...)
	}

	/**
	 * Handle window resizing.
	 * Called from the React component.
	 */
	public onResize(width: number, height: number): void {
		if (!this.app || !this._isInitialized) return;

		// this.app.renderer.resize(width, height);

		const w = width;
		const h = height;

		// ===== HANDS =====

		// Player Hand
		this._playerHand.position.set(w / 2, h * 0.875);
		this._playerHand.resize(w, h);
		this._playerHand.setVisible(true);

		// Top Opponent
		this._topOppHand.position.set(w / 2, h * 0.125);
		this._topOppHand.resize(w, h);
		this._topOppHand.setVisible(true);

		// Left Opponent
		this._leftOppHand.position.set(w * 0.07, h / 2);
		this._leftOppHand.resize(w, h);
		this._leftOppHand.setVisible(true);

		// Right Opponent
		this._rightOppHand.position.set(w * 0.93, h / 2);
		this._rightOppHand.resize(w, h);
		this._rightOppHand.setVisible(true);

		// ===== CARD PILES =====

		let pilesOffset: number = w / 9;

		// Deck
		this._deck.position.set(w / 2 - pilesOffset, h / 2);
		this._deck.resize(w, h);
		this._deck.setVisible(true);

		// Discard
		this._discard.position.set(w / 2 + pilesOffset, h / 2);
		this._discard.resize(w, h);
		this._discard.setVisible(true);
	}

	public destroy(): void {
		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
		}

		if (this.app) {
			if (this._playerHand) this.app.stage.removeChild(this._playerHand);
			if (this._topOppHand) this.app.stage.removeChild(this._topOppHand);
			if (this._leftOppHand) this.app.stage.removeChild(this._leftOppHand);
			if (this._rightOppHand) this.app.stage.removeChild(this._rightOppHand);
			if (this._deck) this.app.stage.removeChild(this._deck);
			if (this._discard) this.app.stage.removeChild(this._discard);

			this._cleanupHand(this._playerHand);
			this._cleanupHand(this._topOppHand);
			this._cleanupHand(this._leftOppHand);
			this._cleanupHand(this._rightOppHand);

			this._cleanupPile(this._deck);
			this._cleanupPile(this._discard);

			if (this._cardPool) {
				this._cardPool.destroy();
			}

			this.app.destroy({ removeView: false }, { children: true });
			this.app = null;
		}

		this._isInitialized = false;
		this._hasGameStarted = false;
		this._pendingGameStart = false;
	}

	private _cleanupHand(hand: Hand): void {
		const cards = hand.children.filter(
			(c) => c instanceof UnoCard,
		) as UnoCard[];
		cards.forEach((c) => {
			hand.removeCard(c);
		});
	}

	private _cleanupPile(pile: CardPile): void {
		const card = pile.card;
		if (card) {
			pile.setCard(null);
		}
	}
}

export const gameService = new GameService();
