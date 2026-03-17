import { useNavigate } from "react-router-dom";
import { Button } from "../../ui";
import ThemeSelector from "./ThemeSelector";
import PlayerList from "./PlayerList";
import { useContext } from "react";
import { LobbyContext } from "../../context/LobbyContext";

function Room({ onBack }) {
	const navigate = useNavigate();

	const { players, bots, code, isHost, addBot, removeBot, masterStart, playerReady } = useContext(LobbyContext);
	const MAX_PLAYERS = 4;
	const totalPlayers = players.length;
	const canStart = totalPlayers >= 2;
	const canRemoveBot = bots > 0;
	const canAddBot = totalPlayers < MAX_PLAYERS;

	return (
		<div className="flex flex-col gap-4">
			<h2 className="text-2xl font-pixelm text-center font-bold">
				ROOM {code}
			</h2>

			<PlayerList players={players} />

			{isHost && (
				<>
					<div className="flex flex-row gap-5">
						<Button
							onClick={addBot}
							disabled={!canAddBot}
						>
							+1 BOT
						</Button>
					
						<Button
							onClick={removeBot}
							disabled={!canRemoveBot}
						>
							-1 BOT
						</Button>
					</div>

					<ThemeSelector />
				
					<Button disabled={!canStart} onClick={masterStart}>
						START
					</Button>
				</>
			)}

			{!isHost && (
				<Button onClick={playerReady}>
					READY
				</Button>
			)}

				<Button variant="secondary" onClick={onBack}>
					BACK
				</Button>
		</div>
	);
}

export default Room;