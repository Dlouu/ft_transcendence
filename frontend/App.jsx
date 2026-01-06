import { Routes, Route } from "react-router-dom"
import AppLayout from "./ui/AppLayout";

import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import Profile from "./pages/Profile";
import Gallery from "./pages/Gallery";
import Paint from "./pages/Paint";

function App() {
	return (
		<AppLayout>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/lobby" element={<Lobby />} />
				<Route path="/game" element={<Game />} />
				<Route path="/profile" element={<Profile />} />
				<Route path="/gallery" element={<Gallery />} />
				<Route path="/paint" element={<Paint />} />
			</Routes>
		</AppLayout>
	);
}

export default App;
