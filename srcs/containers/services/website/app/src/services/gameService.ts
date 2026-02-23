import { Application } from "pixi.js";
import { io, Socket } from "socket.io-client";
import { CardPool } from "./game/domain/CardPool";
import { AssetsManager } from "./game/managers/AssetsManager";
import { CardsTheme } from "./game/domain/GameEnums";
import { TableManager } from "./game/managers/TableManager";
import { InitGameDto } from "./game/dto/init-game.dto";
import { UnoCard } from "./game/domain/UnoCard";
import { handlePlayerCardClicked } from "./gameInputCallbacks";
import { registerServerEventCallbacks } from "./gameServerEventCallbacks";

interface IGameInitOptions {
	canvas: HTMLCanvasElement;
	playerId: string;
}

export class GameService {
	private _app: Application | null = null;
	private _socket: Socket | null = null;

	private _isInitialized: boolean = false;
	private _hasGameStarted: boolean = false;
	private _hasHandInitialized: boolean = false;
	private _ready: Promise<void>;
	private _resolveReady!: () => void;

	private _cardPool!: CardPool;
	private _assetsMangr: AssetsManager = new AssetsManager();
	private _tableManager: TableManager | null = null;
	private _pendingInitGameDto: InitGameDto | null = null;

	constructor() {
		this._app = null;
		this._ready = new Promise((resolve) => {
			this._resolveReady = resolve;
		});
	}

	public async init({ canvas, playerId }: IGameInitOptions): Promise<void> {
		if (!canvas) {
			throw new Error("GameService.init: canvas is required");
		}

		this._app = new Application();

		await this._app.init({
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

		this._cardPool = new CardPool(this._app.stage);

		this._tableManager = new TableManager(
			this._cardPool,
			this._assetsMangr,
			(card) => this.onPlayerCardClicked(card)
		);

		this._isInitialized = true;
		this._resolveReady();
	}

	public initSocket(playerId: string): void {
		const socketOptions = {
			query: {
				playerId: playerId,
			},
			transports: ["websocket"],
		};

		this._socket = io("http://localhost:3000", socketOptions);
		this.registerSocketListeners();
	}

	private registerSocketListeners(): void {
		if (!this._socket) return;

		registerServerEventCallbacks({
			socket: this._socket,
			ready: this._ready,
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
		await this._assetsMangr.loadCardBacks(["uwu"]);

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
		}

		this._hasGameStarted = true;
	}

	private onPlayerCardClicked(card: UnoCard): void {
		handlePlayerCardClicked(card, this._socket);
	}
}

export const gameService = new GameService();
