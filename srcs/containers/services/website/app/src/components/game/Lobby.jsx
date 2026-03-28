import { useState, useContext } from "react";
import { Button, Input } from "../../ui";
import { AuthContext } from "../../context/AuthContext";
import { LobbyContext } from "../../context/LobbyContext";
import { Link } from "react-router-dom";

function Lobby({ onCreate, onJoin }) {
	const [code, setCode] = useState("");
	const { user } = useContext(AuthContext);
	const { publicLobbies } = useContext(LobbyContext);
	const normalizedCode = code.toUpperCase();
	const isValid = normalizedCode.length === 4;
	const [showLobbies, setShowLobbies] = useState(true);
	const isMobile = window.innerWidth < 640;

	const handleJoin = () => {
		if (isValid) onJoin(normalizedCode);
	};

	const HandleHideLobbies = () => {
		setShowLobbies(false);
	};

return (
<>
	<div className="flex flex-col sm:flex-row gap-5 justify-center items-stretch">
		
		{/* Colonne gauche */}
		<div className="flex flex-col gap-3 flex-1">
			<Button onClick={() => onCreate(normalizedCode)}>
				CREATE A NEW ROOM
			</Button>
			<div className="flex flex-row gap-3">
				<Input
					placeholder="ROOM CODE"
					variant="oneline"
					maxLength={4}
					value={normalizedCode}
					onChange={(e) => setCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
					className="text-center tracking-widest text-lg"
					onKeyDown={(e) => {
						if (e.key === "Enter") { e.preventDefault(); handleJoin(); }
					}}
				/>
				<Button variant="login" onClick={handleJoin} disabled={!isValid}>
					JOIN
				</Button>
			</div>
		</div>

		{/* Colonne droite — liste des lobbies */}
		<div className="flex-1 flex flex-col overflow-hidden h-30">
			{publicLobbies?.length > 0 && (
				<button
					onClick={() => setShowLobbies(!showLobbies)}
					className="text opacity-50 hover:opacity-100 text-right pr-2 pb-1 sm:hidden"
				>
					{showLobbies ? "HIDE ROOMS ▲" : "SHOW ROOMS ▼"}
				</button>
			)}
			<div className="overflow-y-auto flex flex-col gap-2 p-2 h-full">
				{publicLobbies?.length === 0 && (
					<p className="text-center text-sm opacity-50 mt-4">No rooms available</p>
				)}
				{(showLobbies || !isMobile) && publicLobbies?.map((lobby) => (
					<div
						key={lobby.code}
						className="group flex justify-between items-center px-4 py-2 rounded-lg border border-white/20 hover:border-white/60 transition-all cursor-pointer shrink-0"
						onClick={() => onJoin(lobby.code)}
					>
						<span className="font-mono tracking-widest font-bold">{lobby.code}</span>
						<span className="text-sm opacity-60">({lobby.total_count}/{lobby.max_players})</span>
						<span className="opacity-0 group-hover:opacity-100">JOIN →</span>
					</div>
				))}
			</div>
		</div>

	</div>
	<p className="text-center mt-5">
		You are logged as{" "}
		<Link to={`/profile/${user?.user_id}`}>{user?.username}</Link>
	</p>
</>
);
}

export default Lobby;
