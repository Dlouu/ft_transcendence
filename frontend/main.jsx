import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import { GameProvider } from "./context/GameContext";

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
	<GameProvider>
		<App />
	</GameProvider>
);
