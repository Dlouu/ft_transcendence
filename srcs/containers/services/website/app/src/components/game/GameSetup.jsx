import { useContext, useState } from "react";
import Lobby from "./Lobby";
import Room from "./Room";
import { LobbyContext } from "../../context/LobbyContext";

function GameSetup() {
	const [mode, setMode] = useState("lobby"); // lobby | room
	const { code, createLobby } = useContext(LobbyContext);

	const createRoom = () => {
		createLobby();
		setMode("room");
	};

	const joinRoom = (code) => {
		setMode("room");
	};

	return (
		<>
			{mode === "lobby" && (
				<Lobby onCreate={createRoom} onJoin={joinRoom} />
			)}

			{mode === "room" && (
				<Room onBack={() => setMode("lobby")} />
			)}
		</>
	);
}

export default GameSetup;
