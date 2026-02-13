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
        throw new Error("Connection rejected: Missing or invalid playerId.");
      }

      const playerId = rawPlayerId;

      console.log(`Player ${playerId}'s trying connection`);

      client.data.playerId = playerId;

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

        console.log(`Player ${client.data.playerId} is connected`);
      }
      else
      {
        console.log(`Player ${client.data.playerId} is not in a game`);
        throw new Error("Player's not in a game.");
      }
    }
    catch (error)
    {
      console.error("Error during connection handshake:", error);
      client.disconnect();
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
