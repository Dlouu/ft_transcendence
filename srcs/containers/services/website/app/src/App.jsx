import { Routes, Route } from "react-router-dom"
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoutes";
import AppLayout from "./ui/AppLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Me from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Friendlist from "./pages/Friendlist";
import Paint from "./pages/Paint";
import Gallery from "./pages/Gallery";
import GalleryImage from "./pages/GalleryImage";
import GalleryAll from "./pages/GalleryAll";
import LobbyPage from "./pages/Lobby";
import Game from "./pages/Game";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

function App() {
	const { user, loading } = useContext(AuthContext);

	if (loading)
		return (<div className="bg-purple-950">Loading...</div>);

	return (
		<AppLayout>
			<Routes>
				<Route path="/" element={user ? <Home /> : <Login />} />
				<Route path="/game" element={<ProtectedRoute><Game /></ProtectedRoute>} />
				<Route path="/lobby/:id" element={<ProtectedRoute><LobbyPage /></ProtectedRoute>} />
				<Route path="/register" element={<Register />}/>
				<Route path="/me" element={<ProtectedRoute><Me /></ProtectedRoute>} />
				<Route path="/profile/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
				<Route path="/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
				<Route path="/gallery/all" element={<ProtectedRoute><GalleryAll /></ProtectedRoute>} />
				<Route path="/gallery/:id" element={<ProtectedRoute><GalleryImage /></ProtectedRoute>} />
				<Route path="/paint" element={<ProtectedRoute><Paint /></ProtectedRoute>} />
				<Route path="/terms" element={<Terms />} />
				<Route path="/privacy" element={<Privacy />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</AppLayout>
	);
}

export default App;
