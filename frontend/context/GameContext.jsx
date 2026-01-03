import { createContext, useState, useEffect } from "react";

export const GameContext = createContext();

export function GameProvider({ children }) {
	const [playerName, setPlayerName] = useState("");
	const [gameState, setGameState] = useState(null);
	const [socket, setSocket] = useState(null);
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
			name: "Caca",
			stats: {
				gamesPlayed: 10,
				gamesWon: 5,
				winRate: 50, //faire un calcul ici plus tard
			},
		});
	}, []);

	useEffect(() => {
		const ws = new WebSocket("ws://localhost:3000/ws");

		ws.onopen = () => console.log("WS connected");
		ws.onmessage = (e) => setGameState(JSON.parse(e.data));
		ws.onclose = () => console.log("WS closed");

		setSocket(ws);

		return () => ws.close();
	}, []);

	return (
		<GameContext.Provider
			value={{
				playerName,
				setPlayerName,
				gameState,
				socket,
				profile,
			}}
		>
			{children}
		</GameContext.Provider>
	);
}