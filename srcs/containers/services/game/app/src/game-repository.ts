import { ConflictException, Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { Game, GameState } from "./domain/UnoGame";
import { UnoPlayer } from "./domain/UnoPlayer";
import { CreateGameDto } from "./dto/create-game.dto";

// Handles the storage and retrieval of Game and Player objects
@Injectable()
export class GameRepositoryService {
	private games: Game[] = [];

	// =================================
	// ===== CREATION AND DELETION =====
	// =================================

	create(createGameDto: CreateGameDto): Game {
		const { roomName, players, botNbr } = createGameDto;

		if (this.getGameByName(roomName)) {
			throw new ConflictException("Game name already exists");
		}

		const newGame = new Game(roomName, players, players.length, botNbr);

		newGame.state = GameState.WAITING_FOR_PLAYERS;

		this.games.push(newGame);

		console.log("Game " + newGame.roomName + " has been created !");

		return newGame;
	}

	deleteGame(game: Game): void {
		this.games = this.games.filter((existingGame) => existingGame !== game);
	}

	// ==============================
	// ======= JOIN AND LEAVE =======
	// ==============================

	/**
	 * Adds a player socket to a game room and synchronizes join/rejoin events.
	 *
	 * Use this when a player connects (or reconnects) to an existing game.
	 * - In waiting states, it emits join information to the player and notifies others.
	 * - In active states, it forwards the flow to the rejoin handler.
	 * @param game - The target game instance to join.
	 * @param playerId - The unique player identifier used to find the player in the game.
	 * @param socket - The player's active Socket.IO connection.
	 * @returns void
	 */
	join(game: Game, playerId: string, socket: Socket): void {
		const player = game.players.find((p) => p._name === playerId);
		if (!player) return;
		else player._socket = socket;

		socket.join(game.roomName);

		if (
			game.state === GameState.PLAYING ||
			game.state === GameState.AWAITING_COLOR_CHOICE
		) {
			this.rejoin(player, game);
			return;
		}

		socket.emit("game:join", {
			game: game.toJson(),
		});

		socket
			.to(game.roomName)
			.emit("game:playerJoined", { playerName: player._name });

		game.connectedPlayers.add(playerId);
	}

	rejoin(player: UnoPlayer, game: Game): void {
		if (!player) return;

		game.connectedPlayers.add(player._id);

		// TODO: Send everything need by the reconnecting player.
		// Current hand, opponents hand sizes, currentPlayerIndex,
		// currentDirection, currentDiscardCard
	}

	/**
	 * Removes a player from the connected players list and notifies the room.
	 *
	 * Use this when a player disconnects or leaves an active game room.
	 * It updates the server-side connection state and emits a leave event
	 * to all other sockets in the same room.
	 * @param game - The game instance the player is leaving.
	 * @param playerId - The unique player identifier to remove from connected players.
	 * @param socket - The disconnecting player's Socket.IO connection.
	 * @returns void
	 */
	leave(game: Game, playerId: string, socket: Socket): void {
		game.connectedPlayers.delete(playerId);

		socket.to(game.roomName).emit("game:playerLeft", { playerId });
	}

	// ===============================
	// ===== FIND GAME OF PLAYER =====
	// ===============================

	/**
	 * Finds and returns a player within a specific game
	 * @param game - The game instance to search in
	 * @param playerId - The unique identifier of the player to find
	 * @returns The UnoPlayer object if found, undefined otherwise
	 */
	getPlayerInGame(game: Game, playerId: string): UnoPlayer | undefined {
		if (!game) {
			return undefined;
		}

		const player = game.players.find((p) => p._name === playerId);
		if (!player) {
			return undefined;
		}

		return player;
	}

	/**
	 * Finds a game that contains a player with the specified name
	 * @param playerId - The name of the player to search for
	 * @returns The Game object if found, undefined otherwise
	 */
	getGameByPlayer(playerId: string): Game | undefined {
		return this.games.find((g) => g.players.some((p) => p._name === playerId));
	}

	/**
	 * Finds a game by its room name
	 * @param room - The room name of the game to find
	 * @returns The Game object if found, undefined otherwise
	 */
	getGameByName(room: string): Game | undefined {
		return this.games.find((g) => g.roomName === room);
	}
}
