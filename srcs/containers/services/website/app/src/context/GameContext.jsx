import { createContext, useState, useEffect } from "react";

export const GameContext = createContext();

export function GameProvider({ children }) {
	const [playerName, setPlayerName] = useState("");
	const [gameState, setGameState] = useState(null);
	const [profile, setProfile] = useState({
		id: null,
		name: "",
		stats: {
			gamesPlayed: 0,
			gamesWon: 0,
			winRate: 0,
		},
	});

	useEffect(() => {
		setProfile({
			id: "local",
			name: "Username",
			stats: {
				gamesPlayed: 10,
				gamesWon: 5,
				winRate: 50, //faire un calcul ici plus tard
			},
		});
	}, []);

	return (
		<GameContext.Provider
			value={{
				playerName,
				setPlayerName,
				gameState,
				profile,
			}}
		>
			{children}
		</GameContext.Provider>
	);
}
