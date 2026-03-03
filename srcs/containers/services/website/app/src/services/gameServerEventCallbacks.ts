import { Socket } from "socket.io-client";
import { InitGameDto } from "./game/dto/init-game.dto";
import { NextTurnDto } from "./game/dto/next-turn.dto";
import { PlayedCardDto } from "./game/dto/played-card.dto";
import { TableManager } from "./game/managers/TableManager";
import { DrawnCardDto } from "./game/dto/drawn-card.dto";
import { CardFamily } from "./game/domain/GameEnums";
import { GameWinDto } from "./game/dto/game-win.dto";
import { RejoinGameDto } from "./game/dto/rejoin-game.dto";

interface RegisterServerEventCallbacksOptions {
	socket: Socket;
	ready: Promise<void>;
	getPlayerId: () => string | null;
	hasHandInitialized: () => boolean;
	setHandInitialized: (value: boolean) => void;
	hasGameStarted: () => boolean;
	setPendingInitGameDto: (value: InitGameDto) => void;
	startGame: () => Promise<void>;
	getTableManager: () => TableManager | null;
}

export function registerServerEventCallbacks({
	socket,
	ready,
	getPlayerId,
	hasHandInitialized,
	setHandInitialized,
	hasGameStarted,
	setPendingInitGameDto,
	startGame,
	getTableManager,
}: RegisterServerEventCallbacksOptions): void {
	socket.once("connect", () => {
		console.log("GameService: Socket connected", socket.id);
	});

	socket.on("connect_error", (err) => {
		console.error("GameService: Connection error", err);
		window.location.href = "/";
	});

	socket.once("disconnect", (reason) => {
		if (reason === "io server disconnect") {
			window.location.href = "/";
		}
	});

	socket.once("game:join", (_payload) => {
		console.log(`You have joined:`, _payload);
	});

	socket.once("game:rejoin", async (_payload: RejoinGameDto) => {
		await ready;

		if (!hasGameStarted()) {
			await startGame();
		}

		getTableManager()?.applyRejoinState(_payload);
		setHandInitialized(true);

		console.log(`You have rejoined:`, _payload);
	});

	socket.once("game:init", async (_payload: InitGameDto) => {
		console.log("You got your initial hand:", _payload);
		await ready;
		if (hasHandInitialized()) return;
		setPendingInitGameDto(_payload);
		setHandInitialized(true);
		socket.emit("game:init:ready");
	});

	socket.once("game:start", async (_payload) => {
		await ready;
		if (hasGameStarted()) return;
		await startGame();
		console.log("The game started:", _payload);
	});

	socket.on("game:played:card:self", async (_payload: PlayedCardDto) => {
		getTableManager()?.removePlayerCard(_payload.cardIndex);
		getTableManager()?.updateDiscardCard(_payload.card);
		console.log(`${_payload.name} played the card:`, _payload);
	});

	socket.on("game:played:card:others", async (_payload: PlayedCardDto) => {
		getTableManager()?.removeOpponentCard(_payload.name, _payload.cardIndex);
		getTableManager()?.updateDiscardCard(_payload.card);
		console.log(`${_payload.name} played the card:`, _payload);
	});

	socket.on("game:draw:self", async (_payload: DrawnCardDto) => {
		getTableManager()?.addPlayerCard(_payload.card);
		console.log(`${_payload.name} drawn the card:`, _payload.card);
	});

	socket.on("game:draw:others", async (_payload: DrawnCardDto) => {
		getTableManager()?.addOpponentCard(_payload.name);
		console.log(`${_payload.name} drawn a card:`, _payload);
	});

	socket.on("game:turn:reverse", async (_payload) => {
		getTableManager()?.mirrorMiddleArrow();
		console.log(`Turn order reversed:`, _payload);
	});

	socket.on("game:wild:choose-color", async (_payload) => {
		getTableManager()?.showCardFamilySelector((cardFamily) => {
			socket.emit("game:wild:color-picked", { cardFamily });
		});
		console.log(`Turn order reversed:`, _payload);
	});

	socket.on("game:wild:new-color", async (_payload: { chosenFamily: CardFamily }) => {
		getTableManager()?.setPilesBackdropColorByCardSet(_payload.chosenFamily);
		getTableManager()?.hideCardFamilySelector();
		console.log(`Wild color changed:`, _payload);
	});

	socket.on("game:nextTurn", async (_payload: NextTurnDto) => {
		getTableManager()?.setActivePlayer(_payload.currentPlayerIndex);
		console.log(`Next turn:`, _payload);
	});

	socket.on("game:deck:empty", async (_payload) => {
		getTableManager()?.setDeckVisible(false);
		console.log(`Deck empty:`);
	});

	socket.on("game:deck:shuffled", async (_payload) => {
		getTableManager()?.setDeckVisible(true);
		console.log(`Deck shuffled:`);
	});

	socket.on("game:uno:pending:self", async (_payload) => {
		getTableManager()?.setUnoButtonText("UNO");
		getTableManager()?.setUnoButtonVisible(true);
		console.log(`Uno shout pending.`);
	});

	socket.on("game:uno:pending:others", async (_payload) => {
		getTableManager()?.setUnoButtonText("UWU");
		getTableManager()?.setUnoButtonVisible(true);
		console.log(`Uno shout pending.`);
	});

	socket.on("game:uno:catched", async (_payload) => {
		getTableManager()?.setUnoButtonVisible(false);
		console.log(`Counter uno catched.`);
	});

	socket.on("game:win", async (_payload: GameWinDto) => {
		getTableManager()?.showVictoryScreen(_payload, getPlayerId() ?? undefined);
		console.log(`Game won:`, _payload);
	});

	socket.on("game:error", (payload) => {
		console.error("GameService: Game error", payload);
		socket.disconnect();
		window.location.href = "/";
	});
}
