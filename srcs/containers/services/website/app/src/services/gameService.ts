import { Application } from "pixi.js";
import { io, Socket } from "socket.io-client";
import { CardPool } from "./game/domain/CardPool";
import { AssetsManager } from "./game/managers/AssetsManager";
import { CardsTheme } from "./game/domain/GameEnums";
import { TableManager } from "./game/managers/TableManager";
import { InitGameDto } from "./game/dto/init-game.dto";
import { UnoCard } from "./game/domain/UnoCard";
import {
	handleDeckClicked,
	handlePlayerCardClicked,
	handleUnoClicked,
} from "./gameInputCallbacks";
import { registerServerEventCallbacks } from "./gameServerEventCallbacks";
import { GAME_CUSTOMIZATION } from "./game/config/gameCustomization";

interface IGameInitOptions {
	canvas: HTMLCanvasElement;
	playerId: string;
}

export class GameService {
	private _app: Application | null = null;
	private _socket: Socket | null = null;
	private _playerId: string | null = null;

	private _isInitialized: boolean = false;
	private _hasGameStarted: boolean = false;
	private _hasHandInitialized: boolean = false;
	private _ready!: Promise<void>;
	private _resolveReady!: () => void;

	private _cardPool!: CardPool;
	private _assetsMangr: AssetsManager = new AssetsManager();
	private _tableManager: TableManager | null = null;
	private _pendingInitGameDto: InitGameDto | null = null;

	constructor() {
		this._app = null;
		this.resetReadyPromise();
	}

	private resetReadyPromise(): void {
		this._ready = new Promise((resolve) => {
			this._resolveReady = resolve;
		});
	}

	public async init({ canvas, playerId }: IGameInitOptions): Promise<void> {
		if (!canvas) {
			throw new Error("GameService.init: canvas is required");
		}

		if (this._isInitialized) {
			this.destroy();
		}

		this._playerId = playerId;

		this._app = new Application();

		await this._app.init({
			canvas: canvas,
			width: canvas.clientWidth,
			height: canvas.clientHeight,
			backgroundColor: GAME_CUSTOMIZATION.app.backgroundColor,
			// backgroundAlpha: 0.3,
			resolution: window.devicePixelRatio || 1,
			autoDensity: true,
			antialias: true,
		});

		this.initSocket(playerId);

		this._cardPool = new CardPool(this._app.stage);
		await this._assetsMangr.loadArrowTexture();

		this._tableManager = new TableManager(
			this._cardPool,
			this._assetsMangr,
			(card) => this.onPlayerCardClicked(card),
			() => this.onDeckClicked(),
			() => this.onUnoClicked(),
		);

		this._isInitialized = true;
		this._resolveReady();
	}

	public initSocket(playerId: string): void {
		const socketOptions = {
			query: {
				playerId: playerId,
			},
			transports: [...GAME_CUSTOMIZATION.app.socketTransports],
		};

		this._socket = io(GAME_CUSTOMIZATION.app.socketUrl, socketOptions);
		this.registerSocketListeners();
	}

	private registerSocketListeners(): void {
		if (!this._socket) return;

		registerServerEventCallbacks({
			socket: this._socket,
			ready: this._ready,
			getPlayerId: () => this._playerId,
			hasHandInitialized: () => this._hasHandInitialized,
			setHandInitialized: (value) => {
				this._hasHandInitialized = value;
			},
			hasGameStarted: () => this._hasGameStarted,
			setPendingInitGameDto: (value) => {
				this._pendingInitGameDto = value;
			},
			startGame: () => this.start(),
			getTableManager: () => this._tableManager,
		});
	}

	private async initGame(dto: InitGameDto): Promise<void> {
		if (!this._tableManager || !this._app) return;

		const theme = dto.cardTheme === "basic" ? CardsTheme.Basic : CardsTheme.Uwu;
		await this._assetsMangr.loadTheme(theme);
		const cardBackVariants = [
			...new Set([
				...GAME_CUSTOMIZATION.app.defaultCardBackVariants,
				...dto.players.map((p) => p.cardBack),
			]),
		];
		await this._assetsMangr.loadCardBacks(cardBackVariants);

		if (this._tableManager.parent !== this._app.stage) {
			this._app.stage.addChild(this._tableManager);
		}

		this._tableManager.initializeGame(dto);
		this._tableManager.resize(this._app.screen.width, this._app.screen.height);
	}

	private async start(): Promise<void> {
		if (!this._isInitialized || this._hasGameStarted) return;

		if (this._pendingInitGameDto) {
			await this.initGame(this._pendingInitGameDto);
			this._pendingInitGameDto = null;
		} else if (this._tableManager && this._app) {
			if (!this._assetsMangr.isLoaded) {
				await this._assetsMangr.loadTheme(GAME_CUSTOMIZATION.app.defaultTheme);
				await this._assetsMangr.loadCardBacks([
					...GAME_CUSTOMIZATION.app.defaultCardBackVariants,
				]);
			}

			if (this._tableManager.parent !== this._app.stage) {
				this._app.stage.addChild(this._tableManager);
			}

			this._tableManager.resize(
				this._app.screen.width,
				this._app.screen.height,
			);
		}

		this._hasGameStarted = true;
	}

	private onPlayerCardClicked(card: UnoCard): void {
		handlePlayerCardClicked(card, this._socket);
	}

	private onDeckClicked(): void {
		handleDeckClicked(this._socket);
	}

	private onUnoClicked(): void {
		handleUnoClicked(this._socket);
	}

	public onResize(width: number, height: number): void {
		if (!this._app || !this._tableManager) {
			return;
		}

		const safeWidth = Math.max(1, Math.floor(width));
		const safeHeight = Math.max(1, Math.floor(height));

		this._app.renderer.resize(safeWidth, safeHeight);
		this._tableManager.resize(safeWidth, safeHeight);
	}

	public destroy(): void {
		if (this._socket) {
			this._socket.removeAllListeners();
			this._socket.disconnect();
			this._socket = null;
		}

		if (this._tableManager) {
			this._tableManager.destroy();
			this._tableManager = null;
		}

		if (this._cardPool) {
			this._cardPool.destroy();
		}

		if (this._app) {
			this._app.destroy(true, { children: true });
			this._app = null;
		}

		this._isInitialized = false;
		this._hasGameStarted = false;
		this._hasHandInitialized = false;
		this._playerId = null;
		this._pendingInitGameDto = null;
		this._assetsMangr = new AssetsManager();
		this.resetReadyPromise();
	}
}

export const gameService = new GameService();
