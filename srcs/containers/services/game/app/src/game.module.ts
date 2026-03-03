import { Module } from "@nestjs/common";
import { GameService } from "./game.service";
import { GameGateway } from "./game.gateway";
import { GameController } from "./game.controller";
import { GameLogicService } from "./game-logic.service";
import { GamePlayService } from "./game-play.service";
import { DeckService } from "./deck.service";
import { GameRepositoryService } from "./game-repository";
import { BotLogicService } from "./bot-logic.service";

@Module({
	providers: [
		GameGateway,
		GameService,
		GameLogicService,
		GamePlayService,
		DeckService,
		GameRepositoryService,
		BotLogicService,
	],
	controllers: [GameController],
	exports: [
		GameService,
		GameGateway,
		GameLogicService,
		GamePlayService,
		DeckService,
		GameRepositoryService,
		BotLogicService,
	],
})
export class GameModule {}
