import { Injectable } from "@nestjs/common";
import { CreateGameDto } from "./dto/create-game.dto";
import { Game, GameState } from "./domain/UnoGame";
import { Server, Socket } from "socket.io";
import { DeckService } from "./deck.service";
import { GameLogicService } from "./game-logic.service";
import { GameRepositoryService } from "./game-repository";
import { GamePlayService } from "./game-play.service";
import { toCardDtoArray } from "./dto/init-game.dto";

@Injectable()
export class GameService {
	private io?: Server;
	private readonly gameInitReadyByRoom = new Map<string, Set<string>>();

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
		const game = this.gameRepository.join(playerId, socket);

		const started = this.gameLogic.tryStart(game);
		if (!started || !this.io || game.discard.length === 0) {
			return;
		}

		this.emitGameInit(game);
	}

	onPlayerInitReady(playerId: string): void {
		if (!this.io) {
			return;
		}

		const game = this.gameRepository.getGameByConnectedPlayer(playerId);
		if (!game || game.state !== GameState.PLAYING) {
			return;
		}

		if (!game.expectedPlayers.includes(playerId)) {
			return;
		}

		const roomReadyPlayers = this.gameInitReadyByRoom.get(game.roomName);
		if (!roomReadyPlayers) {
			return;
		}

		roomReadyPlayers.add(playerId);

		if (roomReadyPlayers.size < game.expectedPlayers.length) {
			return;
		}

		this.io.to(game.roomName).emit("game:start");

		this.gameInitReadyByRoom.delete(game.roomName);
	}

	private emitGameInit(game: Game): void {
		this.gameInitReadyByRoom.set(game.roomName, new Set<string>());

		const topDiscard = game.discard[game.discard.length - 1];
		const players = game.players.map((player) => ({
			name: player._name,
			cardBack: player._cardBack,
		}));

		game.players.forEach((player, index) => {
			const initGameDto = {
				players,
				discardTopCard: {
					cardCode: topDiscard.value,
					cardFamily: topDiscard.family,
				},
				firstPlayerIndex: game.currentPlayerIndex,
				turnDirection: game.currentDirection,
				startCardNbr: 7, // TODO: Replace by a const variable
				playerIndex: index,
				playerHand: toCardDtoArray(player._hand),
				cardTheme: "basic",
			};
			if (player._socket) {
				player._socket.emit("game:init", initGameDto);
			}
		});
	}

	leave(playerId: string, socket: Socket): void {
		const game = this.gameRepository.leave(playerId, socket);

    // Deletion of game it there is no player in it
    // TODO: Check if we do like that or let the bot play for the win
		if (
      game &&
			game.connectedPlayers.size === 0 &&
			game.state != GameState.WAITING_FOR_PLAYERS
		) {
			this.gameInitReadyByRoom.delete(game.roomName);

			console.log(
				`No connected players left in ${game.roomName}. Deleting game.`,
			);
			this.gameRepository.deleteGame(game);
		}
	}


}
