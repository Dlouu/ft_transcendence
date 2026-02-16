import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketServer,
} from "@nestjs/websockets";
import { GameService } from "./game.service";
import { Server, Socket } from "socket.io";
import { GameState } from "./domain/UnoGame";

@WebSocketGateway({ cors: { origin: "*" } })
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly gameService: GameService) {}

  afterInit(server: Server): void {
    this.gameService.setServer(server);
  }

  handleConnection(client: Socket): void {
    try {
      const rawPlayerId = client.handshake.query.playerId;

      if (!rawPlayerId || Array.isArray(rawPlayerId)) {
        throw new Error("Connection rejected: Missing or invalid playerId.");
      }

      const playerId = rawPlayerId;

      // console.log(`Player ${playerId}'s trying connection`);

      client.data.playerId = playerId;

      const game = this.gameService.findGameByPlayer(client.data.playerId);
      if (game) {
        console.log(`Player ${client.data.playerId} is connected`);

        client.join(game.roomName);
        
        this.gameService.join(client.data.playerId, game, client);

        client.emit("game:join", {
          game: game.toJson(),
        });

        client.to(game.roomName).emit("playerJoined", { playerName: client.data.playerId });

        this.gameService.tryStart(game);
      }
      else
      {
        // console.log(`Player ${client.data.playerId} is not in a game`);
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
      const wasConnected = game.connectedPlayers.delete(playerName);
      if (wasConnected) {
        console.log(`Player ${playerName} removed from connectedPlayers in ${game.roomName}`);
      } else {
        console.log(`Player ${playerName} was not in connectedPlayers for ${game.roomName}`);
      }

      client.to(game.roomName).emit("playerLeft", { playerName });

      if (game.connectedPlayers.size === 0 && game.state != GameState.WAITING_FOR_PLAYERS) {
        console.log(`No connected players left in ${game.roomName}. Deleting game.`);
        this.gameService.deleteGame(game);
      }
    }
  }
}
