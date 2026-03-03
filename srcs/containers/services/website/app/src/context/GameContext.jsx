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
			unoCount: 0,
			uwuCount: 0,
			plus4count: 0,
			cardsDrew: 0,
			biggestHand: 0,
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
				unoCount: 5,
				uwuCount: 2,
				plus4count: 4,
				cardsDrew: 124,
				biggestHand: 26,
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
