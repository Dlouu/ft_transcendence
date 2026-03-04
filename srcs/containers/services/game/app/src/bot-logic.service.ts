import { GameDebugService } from './game-debug.service';
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { Game } from "./domain/UnoGame";
import { GamePlayService } from "./game-play.service";
import { GameService } from "./game.service";
import { GameLogicService } from "./game-logic.service";
// Handles bot decision making and automated turn progression.
@Injectable()
export class BotLogicService {
	constructor(
		@Inject(forwardRef(() => GamePlayService))
		private readonly gamePlayService: GamePlayService,
		@Inject(forwardRef(() => GameService))
		private readonly gameService: GameService,
		@Inject(forwardRef(() => GameService))
		private readonly gameLogicService: GameLogicService,
		@Inject(forwardRef(() => GameDebugService))
		private readonly gameDebugService: GameDebugService,
	) {}

	playTurn(game: Game, botIndex: number): Promise<void> {
		this.gameService.drawCard(game.getPlayerByIndex(botIndex)._id);
		return Promise.resolve();
	}
}
