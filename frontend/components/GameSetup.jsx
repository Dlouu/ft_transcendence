import { useState } from "react";
import Lobby from "./Lobby";
import Room from "./Room";

function GameSetup() {
	const [mode, setMode] = useState("lobby"); // lobby | create | join
	const [room, setRoom] = useState(null);
	const [players, setPlayers] = useState([]);
	const [deck, setDeck] = useState("basic");
	const [isHost, setIsHost] = useState(false);

	const createRoom = (code) => {
		setIsHost(true);
		setRoom({ code });
		setPlayers([{ name: "You", type: "human" }]);
		setMode("room");
	};

	const joinRoom = (code) => {
		setIsHost(false);
		setRoom({ code });
		setPlayers([
			{ name: "Host", type: "human" },
			{ name: "You", type: "human" },
			{ name: "Bot1", type: "bot" },
			{ name: "Bot2", type: "bot" },
		]);
		setMode("room");
	};

	return (
		<>
			{mode === "lobby" && (
				<Lobby onCreate={createRoom} onJoin={joinRoom} />
			)}

			{mode === "room" && (
				<Room
					room={room}
					players={players}
					setPlayers={setPlayers}
					deck={deck}
					setDeck={setDeck}
					isHost={isHost}
				/>
			)}
		</>
	);
}

export default GameSetup;
