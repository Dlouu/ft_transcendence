import { Button } from "../../ui";
import SettingsSelector from "./SettingsSelector";
import PlayerList from "./PlayerList";
import { useContext } from "react";
import { LobbyContext } from "../../context/LobbyContext";

function Room() {
	const { players, bots, code, isHost, addBot, removeBot, masterStart, playerReady, leaveLobby } = useContext(LobbyContext);
	const MAX_PLAYERS = 4;
	const totalPlayers = players.length + bots.length;
	const canStart = totalPlayers >= 2;
	const canRemoveBot = bots.length > 0;
	const canAddBot = totalPlayers < MAX_PLAYERS;


	return (
		<div className="flex flex-col gap-4">
			<h2 className="text-2xl font-pixelm text-center font-bold">
				ROOM {code}
			</h2>

			<PlayerList players={players} bots={bots} />

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

					<SettingsSelector />
				
					<Button disabled={!canStart} onClick={() => {
						playerReady();
						masterStart();
					}}>
						START
					</Button>
				</>
			)}

			{!isHost && (
				<Button onClick={playerReady}>
					READY
				</Button>
			)}

				<Button variant="secondary" onClick={leaveLobby}>
					BACK
				</Button>
		</div>
	);
}

export default Room;