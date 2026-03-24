import { CardCode, CardFamily } from './domain/GameEnums';
import { Injectable, Inject } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { CreateGamePlayerDto } from "./dto/create-game.dto";

type LogLevel = "info" | "warn" | "error";

interface BaseLogContext {
	roomName?: string;
	gameId?: string;
	playerId?: string;
	playerName?: string;
	socketId?: string;
	turn?: number;
}

@Injectable()
export class GameLoggerService {
	private readonly serviceName = "game-service";

	constructor(
		@Inject(WINSTON_MODULE_PROVIDER)
		private readonly logger: Logger,
	) {}

	private log(
		level: LogLevel,
		event: string,
		message: string,
		context: BaseLogContext = {},
		extra: Record<string, unknown> = {},
	) {
		this.logger.log(level, message, {
			service: this.serviceName,
			event,
			...context,
			...extra,
		});
	}

	event(
		event: string,
		message: string,
		context?: BaseLogContext,
		extra?: Record<string, unknown>,
	) {
		this.log("info", event, message, context, extra);
	}

	error(
		message: string,
		context?: BaseLogContext,
		error?: Error,
		extra?: Record<string, unknown>,
	) {
		this.log("error", "error", message, context, {
			stack: error?.stack,
			errorMessage: error?.message,
			...extra,
		});
	}

	warn(
		message: string,
		context?: BaseLogContext,
		extra?: Record<string, unknown>,
	) {
		this.log("warn", "warning", message, context, extra);
	}

	// ------------------------
	// 🎮 Game-specific helpers
	// ------------------------

	playerJoin(
		playerId: string,
		playerName: string,
		roomName: string,
		socketId: string,
		playersCount: number,
	) {
		this.event(
			"player_join",
			"Player joined room",
			{ playerId, playerName, roomName, socketId },
			{ playersCount },
		);
	}

	playerRejoin(
		playerId: string,
		playerName: string,
		roomName: string,
		socketId: string,
		playersCount: number,
	) {
		this.event(
			"player_rejoin",
			"Player rejoined room",
			{ playerId, playerName, roomName, socketId },
			{ playersCount },
		);
	}

	playerLeave(
		playerId: string,
		playerName: string,
		roomName: string,
		playersCount: number,
	) {
		this.event(
			"player_leave",
			"Player left room",
			{ playerId, playerName, roomName },
			{ playersCount },
		);
	}

	gameStart(roomName: string, players: string[]) {
		this.event("game_start", "Game started", { roomName }, { players });
	}

	gameCreate(
		roomName: string,
		expectedPlayers: CreateGamePlayerDto[],
		realPlayersCount: number,
		botCount: number,
		theme: string,
	) {
		this.event(
			"game_create",
			"Game created",
			{ roomName },
			{ expectedPlayers, realPlayersCount, botCount, theme },
		);
	}

	gameEnd(
		roomName: string,
		winnerName: string,
		durationMs: number,
		totalTurns: number,
	) {
		this.event(
			"game_end",
			"Game ended",
			{ roomName },
			{ winnerName, durationMs, totalTurns },
		);
	}

	gameDelete(roomName: string, reason: string) {
		this.event("game_delete", "Game deleted", { roomName }, { reason });
	}

	cardPlayed(
		playerId: string,
		playerName: string,
		roomName: string,
		cardCode: CardCode,
		cardFamily: CardFamily,
	) {
		this.event(
			"card_played",
			"Card played",
			{ playerId, playerName, roomName },
			{ cardCode, cardFamily },
		);
	}

	drawCard(
		playerId: string,
		playerName: string,
		roomName: string,
		count: number,
		reason: string,
	) {
		this.event(
			"draw_card",
			"Player drew card(s)",
			{ playerId, playerName, roomName },
			{ count, reason },
		);
	}

	unoCalled(
		playerId: string,
		playerName: string,
		roomName: string,
		isPendingUnoPlayer: boolean,
	) {
		this.event(
			"uno_called",
			"UNO called",
			{ playerId, playerName, roomName },
			{ isPendingUnoPlayer },
		);
	}

	turnDirectionChanged(
		roomName: string,
		direction: string,
	) {
		this.event(
			"turn_direction_changed",
			"Turn direction changed",
			{ roomName },
			{ direction },
		);
	}

	invalidAction(
		playerId: string,
		playerName: string,
		roomName: string,
		action: string,
	) {
		this.warn(
			"Invalid action attempted",
			{ playerId, playerName, roomName },
			{ action, event: "invalid_action" },
		);
	}

	socketConnected(socketId: string, playerId: string, playerName: string) {
		this.event("socket_connected", "Socket connected", {
			socketId,
			playerId,
			playerName,
		});
	}

	socketDisconnected(
		socketId: string,
		playerId: string,
		playerName: string,
	) {
		this.event(
			"socket_disconnected",
			"Socket disconnected",
			{ socketId, playerId, playerName },
		);
	}
}
