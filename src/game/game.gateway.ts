import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { GameService } from "./game.service";
import { CreateGameDto } from "./dto/create-game.dto";
import { UsePipes, ValidationPipe } from "@nestjs/common";
import { Socket } from "socket.io";

@WebSocketGateway({ cors: { origin: "*" } })
export class GameGateway {
  constructor(private readonly gameService: GameService) {}

  @UsePipes(new ValidationPipe())
  @SubscribeMessage("joinGame")
  join(
    @MessageBody() createGameDto: CreateGameDto,
    @ConnectedSocket() client: Socket
  ) {
    const roomName = this.gameService.join(createGameDto)?.roomName;
    client.emit("gameJoined", { roomName });
  }
}
