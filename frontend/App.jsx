import { useState } from "react";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";

function App() {
	const [screen, setSreen] = useState("home");
	const [playerName, setPlayerName] = useState("");

	return (
		<div>
			{screen === "home" && (
				<Home
					onStart={() => setSreen("lobby")}
					playerName={playerName}
					setPlayerName={setPlayerName}
				/>
			)}

			{screen === "lobby" && (
				<Lobby
					playerName={playerName}
					onBack={() => setSreen("home")}
					onStartGame={() => setSreen("game")}
				/>
			)}

			{screen === "game" && (
				<Game
					playerName={playerName}
					onQuit={() => setSreen("home")}
				/>
			)}
		</div>
	);
}

export default App;
