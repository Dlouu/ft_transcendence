import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { GameService } from "./game.service";
import { Socket } from "socket.io";

@WebSocketGateway({ cors: { origin: "*" } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly gameService: GameService) {}

  handleConnection(client: Socket): void {
    try {
      const rawPlayerId = client.handshake.query.playerId;

      if (!rawPlayerId || Array.isArray(rawPlayerId)) {
        console.log(`Connection rejected: Missing or invalid playerId.`);

        client.disconnect();
        return;
      }

      const playerId = rawPlayerId;

      console.log(`Player connected with ID: ${playerId}`);

      client.data.playerId = playerId;
    } catch (error) {
      console.error("Error during connection handshake:", error);
      client.disconnect();
    }

    console.log("Client " + client.data.playerId + " tried connection");

    const test = this.gameService.join(client.data.playerId);
    if (test) {
      console.log("Client id : " + client.data.playerId);

      void client.join(test.roomName);

      client.emit("TestJoin", {
        test: {
          ...test,
          connectedPlayers: [...test.connectedPlayers],
        },
      });

      client.to(test.roomName).emit("playerJoined", { playerName: client.data.playerId });
    }
  }

  handleDisconnect(client: Socket): void {
    const playerName = client.data.playerId;
    console.log("Client " + playerName + " disconnected");

    const game = this.gameService.leave(playerName);
    if (game) {
      client.to(game.roomName).emit("playerLeft", { playerName });
    }
  }
}
