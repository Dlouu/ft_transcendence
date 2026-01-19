import { WebSocketGateway, OnGatewayConnection } from "@nestjs/websockets";
import { GameService } from "./game.service";
import { Socket } from "socket.io";

@WebSocketGateway({ cors: { origin: "*" } })
export class GameGateway implements OnGatewayConnection {
  constructor(private readonly gameService: GameService) {}

  handleConnection(client: Socket): void {
    const playerName = client.handshake.query.playerName as string;

    console.log("Client " + playerName + " tried connection");

    const test = this.gameService.join(playerName);
    if (test) {
      console.log("Client id : " + playerName);

      void client.join(test.roomName);

      client.emit("TestJoin", {
        test: {
          ...test,
          connectedPlayers: [...test.connectedPlayers],
        },
      });

      client.to(test.roomName).emit("playerJoined", { playerName });
    }
  }

  handleDisconnect(client: Socket): void {
    console.log("Client " + client.id + " disconnect");
  }
}
