import { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Lobby from "./Lobby";
import Room from "./Room";
import { LobbyContext } from "../../context/LobbyContext";

function GameSetup() {
	const { id } = useParams();
	const [mode, setMode] = useState(id ? "room" : "lobby");
	const { createLobby, joinLobby } = useContext(LobbyContext);
	const { code } = useContext(LobbyContext);
	const navigate = useNavigate();

	const createRoom = () => {
		createLobby();
	};

	useEffect(() => {
		if (!code && !id) {
			navigate("/");
		}
	}, [code, id, navigate]);

	return (
		<>
			{mode === "lobby" && (
				<Lobby onCreate={createRoom} onJoin={joinLobby} />
			)}

			{mode === "room" && (
				<Room onBack={() => setMode("lobby")} />
			)}
		</>
	);
}

export default GameSetup;
