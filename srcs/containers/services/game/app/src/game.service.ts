import { CardDto } from "./dto/play-card.dto";
import { toInitHandDto } from "./dto/init-hand.dto";
import { ConflictException, Injectable } from "@nestjs/common";
import { CreateGameDto } from "./dto/create-game.dto";
import { Game, GameState } from "./domain/UnoGame";
import { UnoPlayer } from "./domain/UnoPlayer";
import { Card, CardFamily, CardCode, isNumberCard } from "./domain/UnoCard";
import { Server, Socket } from "socket.io";
import { DeckService } from "./deck.service";
import { GameLogicService } from "./game-logic.service";
import { GameRepositoryService } from "./game-repository";
import { GamePlayService } from "./game-play.service";

@Injectable()
export class GameService {
	private io?: Server;

	constructor(
		private readonly gameRepository: GameRepositoryService,
		private readonly gameLogic: GameLogicService,
		private readonly deckService: DeckService,
		private readonly gamePlay: GamePlayService,
	) {}

	setServer(io: Server): void {
		this.io = io;
	}

	create(dto: CreateGameDto): Game {
		return this.gameRepository.create(dto);
	}

	join(playerId: string, socket: Socket): void {
		const game = this.gameRepository.getGameByPlayer(playerId);
		if (!game) throw new Error("Player's not in a game.");

		this.gameRepository.join(game, playerId, socket);

		this.gameLogic.tryStart(game);
	}

	leave(playerId: string, socket: Socket): void {
		const game = this.gameRepository.getGameByPlayer(playerId);
		if (!game) throw new Error("Player's not in a game.");

		this.gameRepository.leave(game, playerId, socket);

    // Deletion of game it there is no player in it
    // TODO: Check if we do like that or let the bot play for the win
		if (
			game.connectedPlayers.size === 0 &&
			game.state != GameState.WAITING_FOR_PLAYERS
		) {
			console.log(
				`No connected players left in ${game.roomName}. Deleting game.`,
			);
			this.gameRepository.deleteGame(game);
		}
	}

  
}
