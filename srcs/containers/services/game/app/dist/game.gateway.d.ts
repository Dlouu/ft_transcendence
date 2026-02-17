import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from "@nestjs/websockets";
import { GameService } from "./game.service";
import { Server, Socket } from "socket.io";
import { PlaceholderEventDto } from "./dto/placeholder-event.dto";
export declare class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly gameService;
    constructor(gameService: GameService);
    afterInit(server: Server): void;
    handleConnection(socket: Socket): void;
    handleDisconnect(socket: Socket): void;
    handlePlaceholderEvent(payload: PlaceholderEventDto, acknowledgement: (response: any) => void): void;
}
