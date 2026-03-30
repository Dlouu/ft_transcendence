import { Socket } from "socket.io-client";
import { InitGameDto } from "./dto/init-game.dto";
import { NextTurnDto } from "./dto/next-turn.dto";
import { PlayedCardDto } from "./dto/played-card.dto";
import { TableManager } from "./managers/TableManager";
import { DrawnCardDto } from "./dto/drawn-card.dto";
import { CardFamily } from "./domain/GameEnums";
import { GameWinDto } from "./dto/game-win.dto";
import { RejoinGameDto } from "./dto/rejoin-game.dto";
import { CardEffectDto } from "./dto/card-effect.dto";

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
	let pendingNextTurn: NextTurnDto | null = null;

	const applyPendingNextTurn = (): void => {
		if (!pendingNextTurn) {
			return;
		}

		const tableManager = getTableManager();
		if (!tableManager) {
			return;
		}

		tableManager.setActivePlayer(pendingNextTurn.currentPlayerIndex);
		pendingNextTurn = null;
	};

	socket.once("connect", () => {
		// console.log("GameService: Socket connected", socket.id);
	});

	socket.on("connect_error", (err) => {
		// console.error("GameService: Connection error", err);
		window.dispatchEvent(new CustomEvent('game_victory'));
	});

	socket.once("disconnect", (reason) => {
		if (reason === "io server disconnect") {
			window.dispatchEvent(new CustomEvent('game_victory'));
		}
	});

	socket.once("game:join", () => {
		// console.log(`You have joined.`);
	});

	socket.once("game:rejoin", async (_payload: RejoinGameDto) => {
		await ready;

		if (!hasGameStarted()) {
			await startGame();
		}

		getTableManager()?.applyRejoinState(_payload);
		applyPendingNextTurn();
		setHandInitialized(true);

		// console.log(`You have rejoined:`, _payload);
	});

	socket.once("game:init", async (_payload: InitGameDto) => {
		// console.log("You got your initial hand:", _payload);
		await ready;
		if (hasHandInitialized()) return;
		setPendingInitGameDto(_payload);
		setHandInitialized(true);
		socket.emit("game:init:ready");
	});

	socket.once("game:start", async () => {
		await ready;
		if (hasGameStarted()) return;
		await startGame();
		applyPendingNextTurn();
		// console.log("The game started.");
	});

	socket.on("game:played:card:self", async (_payload: PlayedCardDto) => {
		getTableManager()?.removePlayerCard(_payload.cardIndex, _payload.card);
		getTableManager()?.updateDiscardCard(_payload.card);
		// console.log(`${_payload.name} played the card:`, _payload);
	});

	socket.on("game:played:card:others", async (_payload: PlayedCardDto) => {
		getTableManager()?.removeOpponentCard(_payload.name, _payload.cardIndex);
		getTableManager()?.updateDiscardCard(_payload.card);
		// console.log(`${_payload.name} played the card:`, _payload);
	});

	socket.on("game:draw:self", async (_payload: DrawnCardDto) => {
		getTableManager()?.addPlayerCard(_payload.card);
		// console.log(`${_payload.name} drawn the card:`, _payload.card);
	});

	socket.on("game:draw:others", async (_payload: DrawnCardDto) => {
		getTableManager()?.addOpponentCard(_payload.name);
		// console.log("Other draw card !");
		// console.log(`${_payload.name} drawn a card:`, _payload);
	});

	socket.on("game:turn:reverse", async () => {
		getTableManager()?.mirrorMiddleArrow();
		// console.log(`Turn order reversed.`);
	});

	socket.on("game:wild:choose-color", async () => {
		getTableManager()?.showCardFamilySelector((cardFamily) => {
			socket.emit("game:wild:color-picked", { cardFamily });
		});
		// console.log(`Turn order reversed.`);
	});

	socket.on(
		"game:wild:new-color",
		async (_payload: { chosenFamily: CardFamily }) => {
			getTableManager()?.setPilesBackdropColorByCardSet(_payload.chosenFamily);
			getTableManager()?.hideCardFamilySelector();
			// console.log(`Wild color changed:`, _payload);
		},
	);

	socket.on("game:card:effect", async (_payload: CardEffectDto) => {
		getTableManager()?.showCardEffect(_payload);
		// console.log("Card effect:", _payload);
	});

	socket.on("game:nextTurn", async (_payload: NextTurnDto) => {
		const tableManager = getTableManager();
		if (!tableManager) {
			pendingNextTurn = _payload;
			return;
		}

		tableManager.setActivePlayer(_payload.currentPlayerIndex);
		// console.log(`Next turn:`, _payload);
	});

	socket.on("game:deck:empty", async () => {
		getTableManager()?.setDeckVisible(false);
		// console.log(`Deck empty:`);
	});

	socket.on("game:deck:shuffled", async () => {
		getTableManager()?.setDeckVisible(true);
		// console.log(`Deck shuffled:`);
	});

	socket.on("game:uno:pending:self", async () => {
		getTableManager()?.setUnoButtonText("UNO");
		getTableManager()?.setUnoButtonVisible(true);
		// console.log(`Uno shout pending.`);
	});

	socket.on("game:uno:pending:others", async () => {
		getTableManager()?.setUnoButtonText("UWU");
		getTableManager()?.setUnoButtonVisible(true);
		// console.log(`Uno shout pending.`);
	});

	socket.on("game:uno:catched", async () => {
		getTableManager()?.setUnoButtonVisible(false);
		// console.log(`Counter uno catched.`);
	});

	socket.on("game:uno:expired", async () => {
		getTableManager()?.setUnoButtonVisible(false);
		// console.log(`Uno catching window expired.`);
	});

	socket.on("game:win", async (_payload: GameWinDto) => {
		getTableManager()?.showVictoryScreen(_payload, getPlayerId() ?? undefined);
		// console.log(`Game won:`, _payload);
	});

	socket.on("game:playerUpdated", async (_payload: { playerIndex: number; name: string; cardBack: string }) => {
		const tableManager = getTableManager();
		if (!tableManager) return;

		tableManager.updateOpponentInfo(_payload.playerIndex, _payload.name, _payload.cardBack);

		// console.log(`Player ${_payload.playerIndex} updated:`, _payload);
	});

	socket.on("game:error", () => {
		// console.error("GameService: Game error");
		socket.disconnect();
		window.dispatchEvent(new CustomEvent('game_victory'));
	});
}
