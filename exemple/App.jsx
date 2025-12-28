import { useState } from "react";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";

function App() {
	const [screen, setScreen] = useState("home");

	return (
		<>
			{screen === "home" && <Home onStart={() => setScreen("lobby")} />}
			{screen === "lobby" && <Lobby onPlay={() => setScreen("game")} />}
			{screen === "game" && <Game onExit={() => setScreen("home")} />}
		</>
	);
}

export default App;