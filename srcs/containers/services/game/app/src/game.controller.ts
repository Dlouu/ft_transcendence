import { Body, Controller, InternalServerErrorException, Post } from "@nestjs/common";
import { CreateGameDto } from "./dto/create-game.dto";
import { RejoinGameFromLobbyDto } from "./dto/rejoin-game-from-lobby.dto";
import { Game } from "./domain/UnoGame";
import { GameService } from "./game.service";

@Controller("game")
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post("create")
  createGame(@Body() dto: CreateGameDto): Record<string, unknown> {
    const room: Game = this.gameService.create(dto);
    if (room)
      return room.toJson();
    else
      throw new InternalServerErrorException("Failed to create game");
  }

  @Post("rejoin")
  rejoinGame(@Body() dto: RejoinGameFromLobbyDto): Record<string, unknown> {
    const game: Game | null = this.gameService.rejoinFromLobby(dto.id, dto);
    if (game)
      return game.toJson();
    else
      throw new InternalServerErrorException("Failed to rejoin game");
  }
}
