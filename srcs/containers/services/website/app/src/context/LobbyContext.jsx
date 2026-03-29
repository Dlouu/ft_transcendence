import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useNotifications } from "../hooks/useNotifications";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export const LobbyContext = createContext();

export function LobbyProvider({ children }) {
	const [code, setCode] = useState("");
	const [master, setMaster] = useState("");
	const [players, setPlayers] = useState([]);
	const [friends, setFriends] = useState([]);
	const [pendingRequests, setPendingRequests] = useState([]);
	const [bots, setBots] = useState([]);
	const [privacy, setPrivacy] = useState(true);
	const [UwUtheme, setUwUTheme] = useState(false);
	const [publicLobbies, setPublicLobbies] = useState([]);
	const { notify } = useNotifications();
	const navigate = useNavigate();
	const location = useLocation();
	const { user, loading } = useContext(AuthContext);
	const socketRef = useRef(null);
	const isHost = master === socketRef.current?.id;
	const [connected, setConnected] = useState(false);
	const prevPathRef = useRef(location.pathname);

	useEffect(() => {
		const previousPath = prevPathRef.current;
		const currentPath = location.pathname;

		if (
			previousPath !== currentPath
			&& previousPath.startsWith("/lobby/")
			&& !currentPath.startsWith("/lobby/")
			&& !currentPath.startsWith("/game")
		) {
			leaveLobby(false);
		}

		prevPathRef.current = currentPath;
	}, [location.pathname]);

	useEffect(() => {
		if (loading || !user) {
			if (socketRef.current) {
				socketRef.current.disconnect();
				socketRef.current = null;
			}
			return;
		}

		socketRef.current = io(`https://${window.location.hostname}:4443`, {
			path: "/ws",
			withCredentials: true,
		});

		socketRef.current.on("lobby_state", (data) => {

			// console.log("lobby_state reçu:", data);
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

		socketRef.current.on("all_lobbies", (data) => {
			setAllLobbies(data);
		});

		socketRef.current.on("available_lobbies", (data) => {
			setAvailableLobbies(data);
		});

		socketRef.current.on("error", (data) => {
			notify(data.message, "error");
		});

		socketRef.current.on("game_start", (data) => {
			navigate("/game");
		});

		socketRef.current.on("room_full", () => {
			notify("Game is full", "error");
		});

		socketRef.current.on("public_lobbies", (data) => {
			setPublicLobbies(data.lobbies);
		});

		socketRef.current.on("friends_list", (data) => {
			const uniqueFriends = (data.friends || []).filter(
				(f, index, self) => self.findIndex(x => x.username === f.username) === index
			);
			setFriends(data.friends || []);
			setPendingRequests(data.pending_requests || []);
		});

		socketRef.current.on("friend_request_sent", (data) => {
			if (data.type === "received") {
				setPendingRequests(prev => [...prev, { username: data.username, user_id: data.user_id }]);
				// console.log("friend_request_sent reçu:", data);
				notify(`${data.username} sent you a friend request`, "info");
			} else if (data.status === "pending") {
				setFriends(prev => {
					if (prev.find(f => f.username === data.username)) return prev;
					return [...prev, { username: data.username, status: "pending" }];
				});
			} else if (data.status === "not found") {
				notify("User not found", "error");
			} else if (data.status === "self") {
				notify("You can't add yourself", "error");
			} else if (data.status === "accepted" || data.status === "pending") {
				notify("Already friends or request pending", "error");
			}
		});

		socketRef.current.on("friend_updated", () => {
			socketRef.current.emit("get_friends");
		});

		socketRef.current.on("friend_removed", (data) => {
			setFriends(prev => prev.filter(f => f.username !== data.username));
		});

		socketRef.current.on("friend_status", (data) => {
			setFriends(prev => prev.map(f =>
				f.username === data.username ? { ...f, online: data.online, inGame: data.in_game } : f
			));
		});

		socketRef.current.on("connect", () => {
			setConnected(true);
			socketRef.current.emit("get_public_lobbies");
			socketRef.current.emit("get_friends");
		});

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

	function leaveLobby(shouldNavigate = true) {
		if (socketRef.current) {
			socketRef.current.emit("leave_lobby");
		}
		setCode("");
		setPlayers([]);
		setBots([]);
		setMaster("");
		if (shouldNavigate) {
			navigate("/");
		}
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
			socketRef.current.emit("get_public_lobbies");
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
		socketRef.current.emit("set_privacy", { privacy });
	}

	function addFriend(username) {
		socketRef.current.emit("add_friend", { username });
	}

	function acceptFriend(requester_id) {
		socketRef.current.emit("accept_friend", { requester_id });
	}

	function rejectFriend(requester_id) {
		socketRef.current.emit("reject_friend", { requester_id });
	}

	function removeFriend(username) {
		socketRef.current.emit("remove_friend", { username });
	}

	return (
		<LobbyContext.Provider value={{
			connected,
			players,
			master,
			bots,
			friends,
			pendingRequests,
			privacy,
			code,
			isHost,
			theme: UwUtheme,
			publicLobbies,
			createLobby,
			joinLobby,
			leaveLobby,
			setTheme,
			setRoomPrivacy,
			addBot,
			removeBot,
			addFriend,
			removeFriend,
			acceptFriend,
			rejectFriend,
			playerReady,
			masterStart
		 }}>
			{children}
		</LobbyContext.Provider>
	);
}
