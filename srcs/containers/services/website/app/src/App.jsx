import { Routes, Route } from "react-router-dom"
import AppLayout from "./ui/AppLayout";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Game from "./pages/Game";
import Profile from "./pages/Profile";
import Gallery from "./pages/Gallery";
import GalleryImage from "./pages/GalleryImage";
import Paint from "./pages/Paint";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoutes";


function App() {
	const { user } = useContext(AuthContext);

	return (
		<AppLayout>
			<Routes>
				<Route path="/" element={user ? <Home /> : <Login />}/>
				<Route path="/game" element={<ProtectedRoute><Game /></ProtectedRoute>}/>
				<Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>}/>
				<Route path="/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>}/>
				<Route path="/gallery/:id" element={<ProtectedRoute><GalleryImage /></ProtectedRoute>}/>
				<Route path="/paint" element={<ProtectedRoute><Paint /></ProtectedRoute>}/>
				<Route path="/terms" element={<Terms />}/>
				<Route path="/privacy" element={<Privacy />}/>
				//friendlist (statut online uniquement)
				//rules (revendication)
				//profile match history
				//settings (avatar)
				//erreurs 404 etc
			</Routes>
		</AppLayout>
	);
}

export default App;
