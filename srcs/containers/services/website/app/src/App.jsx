import { Routes, Route } from "react-router-dom"
import ProtectedRoute from "./routes/ProtectedRoutes";
import AppLayout from "./ui/AppLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Game from "./pages/Game";
import Me from "./pages/Profile";
import Gallery from "./pages/Gallery";
import GalleryImage from "./pages/GalleryImage";
import Paint from "./pages/Paint";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";


function App() {
	const { user, loading } = useContext(AuthContext);

	if (loading)
		return (<div>Loading...</div>);

	return (
		<AppLayout>
			<Routes>
				{/* <Route path="/" element={user ? <Game /> : <Login />}/> */}
				<Route path="/" element={user ? <Home /> : <Login />}/>
				{/* <Route path="/game" element={<Game />}/> */}
				<Route path="/game" element={<ProtectedRoute><Game /></ProtectedRoute>}/>
				<Route path="/register" element={<Register />}/>
				<Route path="/me" element={<ProtectedRoute><Me /></ProtectedRoute>}/>
				<Route path="/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>}/>
				//profile/:id pour les autres utilisateurs
				//room/:id necessaire ?
				//game/:id necessaire ?
				<Route path="/gallery/:id" element={<ProtectedRoute><GalleryImage /></ProtectedRoute>}/>
				<Route path="/paint" element={<ProtectedRoute><Paint /></ProtectedRoute>}/>
				<Route path="/terms" element={<Terms />}/>
				<Route path="/privacy" element={<Privacy />}/>
				//friendlist (statut online uniquement)
				//rules (revendication)
				//profile users
				//settings (avatar)
				//erreurs 404 etc
			</Routes>
		</AppLayout>
	);
}

export default App;
