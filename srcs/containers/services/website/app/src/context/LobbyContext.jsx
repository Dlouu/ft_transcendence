import { createContext, use, useState } from "react";
import { io } from "socket.io-client";

export const LobbyContext = createContext();

export function LobbyProvider({ children }) {
	const [privacy, setPrivacy] = useState("private");
	const [theme, setTheme] = useState("basic");
	const [master, setMaster] = useState("");
	const socket = io("/lobby");

	return (
		<LobbyContext.Provider value={{ createLobby, joinLobby, readyUp, addBot }}>
			{children}
		</LobbyContext.Provider>
	);
}

/*

	const [mode, setMode] = useState("lobby"); // lobby | room
	const [room, setRoom] = useState(null);
	const [players, setPlayers] = useState([]);
	const [deck, setDeck] = useState("basic");
	const [isHost, setIsHost] = useState(false);
*/ 