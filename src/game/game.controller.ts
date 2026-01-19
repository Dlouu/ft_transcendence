import { Body, Controller, Post } from "@nestjs/common";
import { CreateGameDto } from "./dto/create-game.dto";
import { game } from "./domain/game";
import { GameService } from "./game.service";

@Controller("game")
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post("create")
  createGame(@Body() dto: CreateGameDto): game {
    const room: game = this.gameService.create(dto);
    return room;
  }
}
