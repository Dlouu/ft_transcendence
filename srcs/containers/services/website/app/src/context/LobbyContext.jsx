import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useNotifications } from "../hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export const LobbyContext = createContext();

export function LobbyProvider({ children }) {
	const [code, setCode] = useState("");
	const [master, setMaster] = useState("");
	const [players, setPlayers] = useState([]);
	const [bots, setBots] = useState([]);
	const [privacy, setPrivacy] = useState(true);
	const [UwUtheme, setUwUTheme] = useState(false);
	const { notify } = useNotifications();
	const navigate = useNavigate();
	const { user, loading } = useContext(AuthContext);
	const socketRef = useRef(null);
	const isHost = master === socketRef.current?.id;
	const [connected, setConnected] = useState(false);

	useEffect(() => {
		if (loading || !user) {
			if (socketRef.current) {
				socketRef.current.disconnect();
				socketRef.current = null;
			}
			return;
		}

		socketRef.current = io("https://localhost:4443", {
			path: "/ws",
			withCredentials: true,
		});

		socketRef.current.on("lobby_state", (data) => {

			console.log("lobby_state reçu:", data);
			const playersList = data.humans_id.map(id => ({
				id,
				username: data.humans_usernames?.[id] ?? id,
				ready: data.ready_humans_id.includes(id),
				isHost: id === data.supreme_master_user_id,
			}));
			setMaster(data.supreme_master_sid);
			setPlayers(playersList);
			setCode(data.code);
			setBots(data.bots ?? []);
			setPrivacy(data.privacy);
			setUwUTheme(data.theme);
		});

		socketRef.current.on("error", (data) => {
			notify(data.message, "error");
		});

		socketRef.current.on("game_start", (data) => {
			navigate(`/game`);
		});

		socketRef.current.on("room_full", () => {
			notify("Game is full", "error");
		});

		socketRef.current.on("connect", () => setConnected(true));
		socketRef.current.on("disconnect", () => setConnected(false));

		return () => {
			if (socketRef.current) {
				socketRef.current.disconnect();
				socketRef.current = null;
			}
		};
	}, [loading, user]);

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

	function leaveLobby() {
		socketRef.current.emit("leave_lobby");
		setCode("");
		setPlayers([]);
		setBots([]);
		setMaster("");
		navigate("/");
	}

	function joinLobby(code) {
		if (!socketRef.current)
			return;
		socketRef.current.emit("join_lobby_request", { code }, (response) => {
			if (response && response.ok) {
				socketRef.current.emit("join_lobby_socket", { code: response.code });
				navigate(`/lobby/${response.code}`);
				return;
			}
			notify(response?.message || "Unable to join this lobby.", "error");
			navigate("/");
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
		socketRef.current.emit("master_start");
	}

	function setTheme(theme) {
		socketRef.current.emit("set_theme", { theme });
	}

	function setRoomPrivacy(privacy) {
		socketRef.current.emit("set_privacy", { privacy: privacy === "privacy_private" });
	}

	return (
		<LobbyContext.Provider value={{
			connected,
			players,
			master,
			bots,
			privacy,
			code,
			isHost,
			theme: UwUtheme,
			createLobby,
			joinLobby,
			leaveLobby,
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
