import { ConflictException, Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { Game } from "./domain/UnoGame";
import { GameState } from "./domain/GameEnums";
import { UnoPlayer } from "./domain/UnoPlayer";
import { CreateGameDto } from "./dto/create-game.dto";

// Handles the storage and retrieval of Game and Player objects
@Injectable()
export class GameRepositoryService {
	private games: Game[] = [];

	// =================================
	// ===== CREATION AND DELETION =====
	// =================================

	/**
	 * Creates a new game and stores it in memory.
	 *
	 * Use this when a player hosts a new game room.
	 * @param createGameDto - Payload with room name, players, and bot count.
	 * @returns The created Game instance.
	 * @throws ConflictException when the room name already exists.
	 */
	create(createGameDto: CreateGameDto): Game {
		const { roomName, players, botNbr, theme } = createGameDto;

		if (this.getGameByName(roomName)) {
			throw new ConflictException("Game name already exists");
		}

		const cardTheme = theme === "UWU" ? "uwu" : "basic";
		const newGame = new Game(
			roomName,
			players,
			players.length,
			botNbr,
			cardTheme,
		);

		newGame.state = GameState.WAITING_FOR_PLAYERS;

		this.games.push(newGame);

		console.log("Game " + newGame.roomName + " has been created !");

		return newGame;
	}

	/**
	 * Removes a game from the in-memory store.
	 *
	 * Use this when a game ends or is canceled.
	 * @param game - The game instance to remove.
	 * @returns void
	 */
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
	 * @param playerId - The unique player identifier used to find the player in the game.
	 * @param socket - The player's active Socket.IO connection.
	 * @returns The game instance the player joined.
	 */
	join(playerId: string, socket: Socket): Game {
		const game = this.getGameByExpectedPlayer(playerId);
		if (!game) throw new Error("Player's not in a game.");

		if (!game.expectedPlayers.includes(playerId)) {
			throw new ConflictException("Player is not expected in this game");
		}

		let player = this.getPlayerInGame(game, playerId);
		const isFirstJoin = !player;

		if (!player) {
			const newPlayer = new UnoPlayer(playerId, playerId, socket, false);
			const hasJoined = game.addPlayer(newPlayer);
			if (!hasJoined) {
				throw new ConflictException("Unable to join game: game is full");
			}
			player = newPlayer;
		} else {
			player._socket = socket;
		}

		socket.join(game.roomName);

		if (
			game.state === GameState.PLAYING ||
			game.state === GameState.AWAITING_COLOR_CHOICE
		) {
			this.rejoin(player, game);
			return game;
		}

		socket.emit("game:join", {
			game: game.toJson(),
		});

		if (isFirstJoin) {
			socket
				.to(game.roomName)
				.emit("game:playerJoined", { playerName: player._name });
		}

		game.connectedPlayers.add(playerId);

		return game;
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
	 * @param playerId - The unique player identifier to remove from connected players.
	 * @param socket - The disconnecting player's Socket.IO connection.
	 * @returns The game instance the player left.
	 */
	leave(playerId: string, socket: Socket): Game {
		const game = this.getGameByConnectedPlayer(playerId);
		if (!game) throw new Error("Player's not in a game.");

		game.connectedPlayers.delete(playerId);

		socket.to(game.roomName).emit("game:playerLeft", { playerId });

		return game;
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
	 * Finds a game where the player is listed in expected players.
	 * @param playerId - The player identifier to search in expected players.
	 * @returns The Game object if found, undefined otherwise.
	 */
	getGameByExpectedPlayer(playerId: string): Game | undefined {
		return this.games.find((g) => g.expectedPlayers.includes(playerId));
	}

	/**
	 * Finds a game where the player is currently present in game players.
	 * @param playerId - The player identifier to search in connected/current players.
	 * @returns The Game object if found, undefined otherwise.
	 */
	getGameByConnectedPlayer(playerId: string): Game | undefined {
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
