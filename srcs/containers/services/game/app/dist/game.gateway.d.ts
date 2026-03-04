import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from "@nestjs/websockets";
import { GameService } from "./game.service";
import { GameLogicService } from "./game-logic.service";
import { Server, Socket } from "socket.io";
import { PlaceholderEventDto } from "./dto/placeholder-event.dto";
import { CardDto } from "./dto/card.dto";
import { CardFamily } from "./domain/GameEnums";
export declare class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly gameService;
    private readonly gameLogic;
    constructor(gameService: GameService, gameLogic: GameLogicService);
    afterInit(server: Server): void;
    handleConnection(socket: Socket): void;
    handleDisconnect(socket: Socket): void;
    handleGameInitReady(socket: Socket): void;
    handlePlayCard(payload: CardDto, socket: Socket): Promise<void>;
    handleDraw(socket: Socket): void;
    handleShoutUno(socket: Socket): void;
    handleWildColorPicked(payload: {
        cardFamily: CardFamily;
    }, socket: Socket): void;
    handlePlaceholderEvent(payload: PlaceholderEventDto, acknowledgement: (response: any) => void): void;
}
