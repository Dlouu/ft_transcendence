import { Application } from "pixi.js";
import { io, Socket } from "socket.io-client";
import { Hand, HandRotation } from "./game/domain/Hand";
import { UnoCard } from "./game/domain/UnoCard";
import { CardPool } from "./game/domain/CardPool";
import {
	AssetsManager,
	CardSet,
	CardsTheme,
	CardValue,
} from "./game/managers/AssetsManager";
import { CardPile } from "./game/domain/CardPile";
import { StartGameDto } from "./game/dto/start-game.dto";
import { InitHandDto } from "./game/dto/init-hand.dto";

interface IGameInitOptions {
	canvas: HTMLCanvasElement;
	playerId: string;
}

export class GameService {
	private app: Application | null = null;
	private socket: Socket | null = null;
	private _ready: Promise<void>;
	private _resolveReady!: () => void;

	private _isInitialized: boolean = false;
	private _hasGameStarted: boolean = false;
	private _hasHandInitialized: boolean = false;

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
	private _assetsMangr: AssetsManager = new AssetsManager();

	constructor() {
		this.app = null;
		this._ready = new Promise((resolve) => {
			this._resolveReady = resolve;
		});
		this._isInitialized = false;
		this._hasGameStarted = false;
		this._hasHandInitialized = false;
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
		this._resolveReady();

		this.onResize(canvas.clientWidth, canvas.clientHeight);
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
		this.socket.once("game:join", (_payload) => {
			console.log(`You have joined:`, _payload);
		});

		this.socket.once("game:rejoin", (_payload) => {
			console.log(`You have rejoined:`, _payload);
		});

		this.socket.once("game:initHand", async (_payload: InitHandDto) => {
			console.log("You got your initial hand:", _payload);
			await this._ready;
			if (this._hasHandInitialized) return;
			this.initHands(_payload);
			this._hasHandInitialized = true;
		});

		this.socket.once("game:start", async (_payload: StartGameDto) => {
			await this._ready;
			if (this._hasGameStarted) return;
			this.start(_payload);
			console.log("The game started:", _payload);
		});

		this.socket.on("game:error", (payload) => {
			console.error("GameService: Game error", payload);
			this.socket?.disconnect();
			window.location.href = "/";
		});
	}

	public start(dto: StartGameDto): void {
		if (!this.app || !this._isInitialized || this._hasGameStarted) return;

		this._hasGameStarted = true;

		const deckCard = this._cardPool.getCard();
		deckCard.setFaceBackCard(this._assetsMangr.getCardBack("uwu"), true);
		this._deck.setCard(deckCard);

		const discardCard = this._cardPool.getCard();
		discardCard.setFaceBackCard(
			this._assetsMangr.getCardTexture(
				dto.discardTopCard.cardFamily as unknown as CardSet,
				dto.discardTopCard.cardCode as unknown as CardValue,
			),
			true,
		);
		this._discard.setCard(discardCard);

		this._playerHand.setVisible(true);

		// Pixi handles the loop automatically via app.ticker
		this.app.ticker.add((ticker) => {
			this.update(ticker.deltaTime);
		});
	}

	private initHands(dto: InitHandDto): void {
		this._playerHand.setVisible(false);
		for (let i = 0; i < dto.hand.length; i++) {
			const card = this._cardPool.getCard();
			const texture = this._assetsMangr.getCardTexture(
				dto.hand[i].cardFamily as unknown as CardSet,
				dto.hand[i].cardCode as unknown as CardValue,
			);
			card.setFaceUpCard(texture, true);
			this._playerHand.addCard(card);
		}
	}

	/**
	 * Main Game Loop
	 * @param _dt Delta time from Pixi Ticker
	 */
	private update(_dt: number): void {
		// Add your game logic here
		// Example: socket.emit('playerMove', ...)
	}

	// ======================
	// ======= RESIZE =======
	// ======================

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

	// =======================
	// ======= CLEANUP =======
	// =======================

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
		this._hasHandInitialized = false;
		this._ready = new Promise((resolve) => {
			this._resolveReady = resolve;
		});
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
