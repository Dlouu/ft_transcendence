import { Application } from "pixi.js";
import { io, Socket } from "socket.io-client";
import { CardPool } from "./game/domain/CardPool";
import { AssetsManager, CardsTheme } from "./game/managers/AssetsManager";
import { TableManager } from "./game/managers/TableManager";
import { InitGameDto } from "./game/dto/init-game.dto";

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

		this._tableManager = new TableManager(this._cardPool, this._assetsMangr);

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

		this._socket.once("connect", () => {
			console.log("GameService: Socket connected", this._socket?.id);
		});

		this._socket.on("connect_error", (err) => {
			console.error("GameService: Connection error", err);
			window.location.href = "/";
		});

		this._socket.once("disconnect", (reason) => {
			if (reason === "io server disconnect") {
				window.location.href = "/";
			}
		});

		this._socket.once("game:join", (_payload) => {
			console.log(`You have joined:`, _payload);
		});

		this._socket.once("game:rejoin", (_payload) => {
			console.log(`You have rejoined:`, _payload);
		});

		this._socket.once("game:init", async (_payload: InitGameDto) => {
			console.log("You got your initial hand:", _payload);
			await this._ready;
			if (this._hasHandInitialized) return;
			this._pendingInitGameDto = _payload;
			this._hasHandInitialized = true;
			this._socket?.emit("game:init:ready");
		});

		this._socket.once("game:start", async (_payload) => {
			await this._ready;
			if (this._hasGameStarted) return;
			await this.start();
			console.log("The game started:", _payload);
		});

		this._socket.on("game:error", (payload) => {
			console.error("GameService: Game error", payload);
			this._socket?.disconnect();
			window.location.href = "/";
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
}

export const gameService = new GameService();
