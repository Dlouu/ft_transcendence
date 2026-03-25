import { Type } from "class-transformer";
import {
	ArrayMinSize,
	IsArray,
	IsBoolean,
	IsInt,
	IsString,
	Min,
	ValidateNested,
} from "class-validator";
import { Game } from "../domain/UnoGame";

export interface IPlayerStatsPayload {
	user_id: string;
	is_bot: boolean;
	win_game: boolean;
	nbr_uno: number;
	nbr_uwu: number;
	nbr_4cards: number;
	nbr_drew: number;
	biggest_hand: number;
}

export class PlayerStatsPayloadDto implements IPlayerStatsPayload {
	@IsString()
	user_id: string;

	@IsBoolean()
	is_bot: boolean;

	@IsBoolean()
	win_game: boolean;

	@IsInt()
	@Min(0)
	nbr_uno: number;

	@IsInt()
	@Min(0)
	nbr_uwu: number;

	@IsInt()
	@Min(0)
	nbr_4cards: number;

	@IsInt()
	@Min(0)
	nbr_drew: number;

	@IsInt()
	@Min(0)
	biggest_hand: number;

	toJson(): IPlayerStatsPayload {
		return {
			user_id: this.user_id,
			is_bot: this.is_bot,
			win_game: this.win_game,
			nbr_uno: this.nbr_uno,
			nbr_uwu: this.nbr_uwu,
			nbr_4cards: this.nbr_4cards,
			nbr_drew: this.nbr_drew,
			biggest_hand: this.biggest_hand,
		};
	}
}

export interface IStatsPayload {
	players: IPlayerStatsPayload[];
}

export class StatsPayloadDto implements IStatsPayload {
	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => PlayerStatsPayloadDto)
	players: PlayerStatsPayloadDto[];

	toJson(): IStatsPayload {
		return {
			players: this.players.map((player) => player.toJson()),
		};
	}
}

const getPlayerIntStat = (
	player: Game["players"][number] | undefined,
	keys: string[],
	defaultValue = 0,
): number => {
	if (!player) {
		return defaultValue;
	}

	const playerRecord = player as unknown as Record<string, unknown>;

	for (const key of keys) {
		const value = playerRecord[key];
		if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
			return Math.floor(value);
		}
	}

	return defaultValue;
};

export const toStatsPayloadDto = (game: Game): StatsPayloadDto => {
	const dto = new StatsPayloadDto();
	const winner = game.players.find((player) => player._hand.length === 0);

	dto.players = game.expectedPlayers.map((expectedPlayer) => {
		const player = game.players.find((candidate) => candidate._id === expectedPlayer.id);
		const playerStats = new PlayerStatsPayloadDto();

		playerStats.user_id = expectedPlayer.id;
		playerStats.is_bot = false;
		playerStats.win_game = winner?._id === expectedPlayer.id;
		playerStats.nbr_uno = getPlayerIntStat(player, ["nbr_uno"]);
		playerStats.nbr_uwu = getPlayerIntStat(player, ["nbr_uwu"]);
		playerStats.nbr_4cards = getPlayerIntStat(player, ["nbr_4cards"]);
		playerStats.nbr_drew = getPlayerIntStat(player, ["nbr_drew"]);
		playerStats.biggest_hand = getPlayerIntStat(
			player,
			["biggest_hand"],
			player?._hand.length ?? 0,
		);

		return playerStats;
	});

	return dto;
};
