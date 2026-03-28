import { createContext, useCallback, useState } from "react";

export const GameContext = createContext();

const EMPTY_PROFILE = {
	id: null,
	username: "",
	name: "",
	profile_picture_url: null,
	card_back_url: null,
	stats: {
		gamesPlayed: 0,
		gamesWon: 0,
		winRate: 0,
		unoCount: 0,
		uwuCount: 0,
		plus4count: 0,
		cardsDrew: 0,
		biggestHand: 0,
	},
};

function normalizeStats(rawStats) {
	const stats = rawStats?.data ?? rawStats?.stats ?? rawStats ?? {};

	return {
		gamesPlayed: stats.gamesPlayed ?? stats.games_played ?? 0,
		gamesWon: stats.gamesWon ?? stats.games_won ?? 0,
		winRate: stats.winRate ?? stats.winrate ?? stats.win_rate ?? 0,
		unoCount: stats.unoCount ?? stats.uno_count ?? stats.nbr_uno ?? 0,
		uwuCount: stats.uwuCount ?? stats.uwu_count ?? stats.nbr_uwu ?? 0,
		plus4count: stats.plus4count ?? stats.plus4_count ?? stats.nbr_4cards ?? 0,
		cardsDrew: stats.cardsDrew ?? stats.cards_drew ?? stats.nbr_drew ?? 0,
		biggestHand: stats.biggestHand ?? stats.biggest_hand ?? 0,
	};
}

function normalizeProfile(rawData, statsOverride) {
	const stats = statsOverride ?? rawData?.stats;

	return {
		id: rawData?.id ?? rawData?.user_id ?? null,
		username: rawData?.username ?? rawData?.name ?? "",
		name: rawData?.name ?? rawData?.username ?? "",
		profile_picture_url: rawData?.profile_picture_url ?? null,
		card_back_url: rawData?.card_back_url ?? null,
		stats: normalizeStats(stats),
	};
}

export function GameProvider({ children }) {
	const [playerName, setPlayerName] = useState("");
	const [gameState, setGameState] = useState(null);
	const [profile, setProfile] = useState(EMPTY_PROFILE);
	const [profileLoading, setProfileLoading] = useState(false);
	const [profileNotFound, setProfileNotFound] = useState(false);

	const fetchPublicProfile = useCallback(async (userId) => {
		if (!userId) {
			setProfile(EMPTY_PROFILE);
			setProfileNotFound(false);
			return null;
		}

		setProfileLoading(true);
		setProfileNotFound(false);

		try {
			const profileRes = await fetch(`/api/user/me/${userId}`, {
				credentials: "include",
			});

			if (profileRes.status === 404) {
				setProfile(EMPTY_PROFILE);
				setProfileNotFound(true);
				return null;
			}

			if (!profileRes.ok)
				throw new Error("Failed to fetch public profile");

			const profileData = await profileRes.json();

			let statsData = null;
			try {
				const statsRes = await fetch(`/api/user/game/stats/${userId}`, {
					credentials: "include",
				});

				if (statsRes.ok) {
					statsData = await statsRes.json();
				} else if (statsRes.status !== 404) {
					throw new Error("Failed to fetch user game stats");
				}
			} catch {
				statsData = null;
			}

			const normalizedProfile = normalizeProfile(profileData, statsData);
			setProfile(normalizedProfile);
			setProfileNotFound(false);
			return normalizedProfile;
		} catch {
			setProfile(EMPTY_PROFILE);
			setProfileNotFound(false);
			return null;
		} finally {
			setProfileLoading(false);
		}
	}, []);

	return (
		<GameContext.Provider
			value={{
				playerName,
				setPlayerName,
				gameState,
				profile,
				profileLoading,
				profileNotFound,
				fetchPublicProfile,
			}}
		>
			{children}
		</GameContext.Provider>
	);
}
