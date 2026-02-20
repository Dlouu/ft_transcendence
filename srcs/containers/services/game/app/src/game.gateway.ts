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
import { Server, Socket } from "socket.io";
import { Game, GameState } from "./domain/UnoGame";
import { DeckService } from "./deck.service";
import { GameLogicService } from "./game-logic.service";
import { GamePlayService } from "./game-play.service";
import { GameRepositoryService } from "./game-repository";
import { PlaceholderEventDto } from "./dto/placeholder-event.dto";

@WebSocketGateway({ cors: { origin: "*" } })
export class GameGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	constructor(private readonly gameService: GameService) {}

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


	@SubscribeMessage("placeholder:event")
	handlePlaceholderEvent(
		@MessageBody() payload: PlaceholderEventDto, // Gets the client-sent event payload from the message body.
		@Ack() acknowledgement: (response: any) => void, // Injects the Socket.IO ack callback to answer this event.
	): void {
		console.log("placeholder event go !"); // Logs that this listener was triggered.
		acknowledgement({ // Sends an acknowledgement response back to the emitting client.
			ok: true, // Marks the operation as successful.
			event: "placeholder:event", // Echoes the event name for client-side confirmation.
			payload, // Returns the received payload for debugging/verification.
		});
	}
}
