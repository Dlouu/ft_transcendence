import { useState } from "react";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import Profile from "./pages/Profile";

function App() {
	const [screen, setSreen] = useState("home");

	return (
		<div>
			{screen === "home" && (
				<Home
					onStart={() => setSreen("lobby")}
				/>
			)}

			{screen === "lobby" && (
				<Lobby
					onProfile={() => setSreen("profile")}
					onBack={() => setSreen("home")}
					onStartGame={() => setSreen("game")}
				/>
			)}

			{screen === "game" && (
				<Game
					onQuit={() => setSreen("lobby")}
				/>
			)}

			{screen === "profile" && (
				<Profile
					onBack={() => setSreen("lobby")}
				/>
			)}
		</div>
	);
}

export default App;
