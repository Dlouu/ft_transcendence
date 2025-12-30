import { useState } from "react";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";

function App() {
	const [screen, setSreen] = useState("home");

	return (
		<div>
			{screen === "home" && (
				<Home onStart={() => setSreen("lobby")} />
			)}

			{screen === "lobby" && (
				<Lobby
					onBack={() => setSreen("home")}
					onStartGame={() => setSreen("game")}
				/>
			)}

			{screen === "game" && (
				<Game onQuit={() => setSreen("home")} />
			)}
		</div>
	);
}

export default App;
