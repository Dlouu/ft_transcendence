import { createContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useNotifications } from "../hooks/useNotifications";
import { useNavigate } from "react-router-dom";

export const LobbyContext = createContext();

export function LobbyProvider({ children }) {
	const [code, setCode] = useState("");
	const [master, setMaster] = useState("");
	const [players, setPlayers] = useState([]);
	const [bots, setBots] = useState(0);
	const [privacy, setPrivacy] = useState(true);
	const [UwUtheme, setUwUTheme] = useState(false);
	const { notify } = useNotifications();
	const navigate = useNavigate();
	const socketRef = useRef(null);
	const isHost = master === socketRef.current?.id;

	useEffect(() => {
		//test a delete quand les sockets fonctionneront
		console.log("🔌 Tentative de connexion socket...");
		socketRef.current = io("/lobby");
		socketRef.current.on("connect", () => {
			console.log("✅ Socket connecté ! ID:", socketRef.current.id);
		});
		socketRef.current.on("connect_error", (err) => {
			console.log("❌ Erreur connexion:", err.message);
		});

		socketRef.current.on("lobby_state", (data) => {

			const playersList = data.humans_sid.map(sid => ({
				sid,
				id: data.humans_id[data.humans_sid.indexOf(sid)],
				ready: data.ready_humans.includes(sid),
				isHost: sid === data.supreme_master_sid,
			}));
			setMaster(data.supreme_master_sid);
			setPlayers(playersList);
			setCode(data.code);
			setBots(data.bots_count ?? 0);
			setPrivacy(data.privacy);
			setUwUTheme(data.theme);
		});

		socketRef.current.on("error", (data) => {
			notify(data.message, "error");
		});

		socketRef.current.on("game_start", (data) => {
			navigate(`/game/${data.code}`);
		});

		socketRef.current.on("room_full", () => {
			notify("Game is full", "error");
		});

		return () => {
			socketRef.current.disconnect();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function createLobby() {
		socketRef.current.emit("create_lobby", {}, (response) => {
			if (response && response.ok) {
				socketRef.current.emit("join_lobby_socket", { code: response.code });
				navigate(`/lobby/${response.code}`);
				return;
			}
			notify(response?.message || "Unable to create a lobby.", "error");
		});
	}

	function joinLobby(code) {
		socketRef.current.emit("join_lobby_request", { code }, (response) => {
			if (response && response.ok) {
				socketRef.current.emit("join_lobby_socket", { code: response.code });
				navigate(`/lobby/${response.code}`);
				return;
			}
			notify(response?.message || "Unable to join this lobby.", "error");
		});
	}

	function playerReady() {
		socketRef.current.emit("player_ready");
	}

	function addBot() {
		socketRef.current.emit("add_bot");
	}

	function removeBot() {
		socketRef.current.emit("remove_bot");
	}

	function masterStart() {
		socketRef.current.emit("master-start");
	}

	function setTheme(theme) {
		socketRef.current.emit("set_theme", { theme });
	}

	function setRoomPrivacy(privacy) {
		socketRef.current.emit("set_privacy", { privacy: privacy === "privacy_private" });
	}

	return (
		<LobbyContext.Provider value={{
			players,
			bots,
			privacy,
			code,
			isHost,
			theme: UwUtheme,
			createLobby,
			joinLobby,
			setTheme,
			setRoomPrivacy,
			addBot,
			removeBot,
			playerReady,
			masterStart
		 }}>
			{children}
		</LobbyContext.Provider>
	);
}


// tu cliques CREATE 
// → emit("create_lobby") 
// → serveur crée la room et te donne un code
// → tu navigues vers /lobby/:code
// → tu emit("join_lobby_socket", { code })
// → serveur t'ajoute à la room
// → serveur emit("lobby_state") avec toi dedans
// → tes états se mettent à jour