import { Body, Controller, Post } from "@nestjs/common";
import { CreateGameDto } from "./dto/create-game.dto";
import { Game } from "./domain/UnoGame";
import { GameService } from "./game.service";

@Controller("game")
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post("create")
  createGame(@Body() dto: CreateGameDto): Record<string, unknown> {
    const room: Game = this.gameService.create(dto);
    return room.toJson();
  }
}
