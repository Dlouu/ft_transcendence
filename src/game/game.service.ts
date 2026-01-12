import { Injectable } from "@nestjs/common";
import { CreateGameDto } from "./dto/create-game.dto";

@Injectable()
export class GameService {
  create(createGameDto: CreateGameDto) {
    return "This action adds a new game";
  }
}
