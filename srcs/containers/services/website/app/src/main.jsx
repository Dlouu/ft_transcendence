import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import { GameProvider } from "./context/GameContext";
import { LobbyProvider } from "./context/LobbyContext";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AlertProvider } from "./context/AlertContext";
import Notifications from "./ui/Notifications";

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
	<AuthProvider>
		<AlertProvider>
			<BrowserRouter>
				<LobbyProvider>
					<GameProvider>
						<App />
						<Notifications />
					</GameProvider>
				</LobbyProvider>
			</BrowserRouter>
		</AlertProvider>
	</AuthProvider>
);
