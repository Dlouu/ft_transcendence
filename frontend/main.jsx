import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import { GameProvider } from "./context/GameContext";
import { BrowserRouter } from "react-router-dom";

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
	<BrowserRouter>
		<GameProvider>
			<App />
		</GameProvider>
	</BrowserRouter>
);
