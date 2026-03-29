import {
	WebSocketGateway,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	MessageBody,
	ConnectedSocket,
} from "@nestjs/websockets";
import { GameService } from "./game.service";
import { GameLogicService } from "./game-logic.service";
import { Server, Socket } from "socket.io";
import { CardDto } from "./dto/card.dto";
import { CardFamily } from "./domain/GameEnums";
import { GameLoggerService } from "./logger.service";

@WebSocketGateway({ cors: { origin: "*" } })
export class GameGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	constructor(
		private readonly gameService: GameService,
		private readonly gameLogic: GameLogicService,
		private readonly logger: GameLoggerService,
	) {}

	afterInit(server: Server): void {
		this.gameService.setServer(server);
	}

	handleConnection(socket: Socket): void {
		try {
			const playerId = socket.handshake.query.playerId;
			// const playerName = socket.handshake.query.playerName;

			if (typeof playerId !== "string" || playerId.trim() === "") {
				throw new Error("Connection rejected: Missing or invalid playerId.");
			}
			// else if (typeof playerName !== "string" || playerName.trim() === "") {
			// 	throw new Error("Connection rejected: Missing or invalid playerName.");
			// }

			this.logger.socketConnected(socket.id, playerId);

			socket.data.playerId = playerId; // Saving access for disconnection

			this.gameService.join(playerId, socket);
		} catch (error) {
			console.error("Error during connection:", error);
			socket.disconnect();
		}
	}

	handleDisconnect(socket: Socket): void {
		this.gameService.leave(socket.data.playerId, socket);

		this.logger.socketDisconnected(socket.id, socket.data.playerId);
	}

	@SubscribeMessage("game:init:ready")
	handleGameInitReady(@ConnectedSocket() socket: Socket): void {
		const playerId = socket.data.playerId;
		if (typeof playerId !== "string" || playerId.trim() === "") {
			return;
		}

		this.gameService.onPlayerInitReady(playerId);
	}

	@SubscribeMessage("game:play:card")
	async handlePlayCard(
		@MessageBody() payload: CardDto,
		@ConnectedSocket() socket: Socket,
	): Promise<void> {
		const playerId = socket.data.playerId;
		if (typeof playerId !== "string" || playerId.trim() === "") {
			return;
		}

		await this.gameService.playCard(playerId, payload, undefined);
	}

	@SubscribeMessage("game:play:draw")
	handleDraw(@ConnectedSocket() socket: Socket): void {
		const playerId = socket.data.playerId;
		if (typeof playerId !== "string" || playerId.trim() === "") {
			return;
		}

		this.gameService.drawCard(playerId, undefined);
	}

	@SubscribeMessage("game:play:uno")
	handleShoutUno(@ConnectedSocket() socket: Socket): void {
		const playerId = socket.data.playerId;
		if (typeof playerId !== "string" || playerId.trim() === "") {
			return;
		}

		this.gameService.shoutUno(playerId);
	}

	@SubscribeMessage("game:wild:color-picked")
	handleWildColorPicked(
		@MessageBody() payload: { cardFamily: CardFamily },
		@ConnectedSocket() socket: Socket,
	): void {
		const playerId = socket.data.playerId;
		if (typeof playerId !== "string" || playerId.trim() === "") {
			return;
		}

		this.gameLogic.onColorPicked(playerId, payload.cardFamily);
	}
}
