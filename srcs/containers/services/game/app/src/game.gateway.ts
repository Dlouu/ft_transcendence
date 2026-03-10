import {
	WebSocketGateway,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	WebSocketServer,
	SubscribeMessage,
	MessageBody,
	Ack,
	ConnectedSocket,
} from "@nestjs/websockets";
import { GameService } from "./game.service";
import { GameLogicService } from "./game-logic.service";
import { Server, Socket } from "socket.io";
import { PlaceholderEventDto } from "./dto/placeholder-event.dto";
import { CardDto } from "./dto/card.dto";
import { CardFamily } from "./domain/GameEnums";

@WebSocketGateway({ cors: { origin: "*" } })
export class GameGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	constructor(
		private readonly gameService: GameService,
		private readonly gameLogic: GameLogicService,
	) {}

	afterInit(server: Server): void {
		this.gameService.setServer(server);
	}

	handleConnection(socket: Socket): void {
		try {
			const playerId = socket.handshake.query.playerId;

			if (typeof playerId !== "string" || playerId.trim() === "") {
				throw new Error("Connection rejected: Missing or invalid playerId.");
			}

			socket.data.playerId = playerId; // Saving access for disconnection

			this.gameService.join(playerId, socket);
		} catch (error) {
			console.error("Error during connection:", error);
			socket.disconnect();
		}
	}

	handleDisconnect(socket: Socket): void {
		this.gameService.leave(socket.data.playerId, socket);
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
		console.log(
			`Player ${playerId} play the card ${payload.cardCode} ${payload.cardFamily}`,
		);
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

	@SubscribeMessage("placeholder:event")
	handlePlaceholderEvent(
		@MessageBody() payload: PlaceholderEventDto, // Gets the client-sent event payload from the message body.
		@Ack() acknowledgement: (response: any) => void, // Injects the Socket.IO ack callback to answer this event.
	): void {
		console.log("placeholder event go !"); // Logs that this listener was triggered.
		acknowledgement({
			// Sends an acknowledgement response back to the emitting client.
			ok: true, // Marks the operation as successful.
			event: "placeholder:event", // Echoes the event name for client-side confirmation.
			payload, // Returns the received payload for debugging/verification.
		});
	}
}
