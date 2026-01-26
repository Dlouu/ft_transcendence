import { useNavigate } from "react-router-dom";
import { Button } from "../ui";
import DeckSelector from "./DeckSelector";
import PlayerList from "./PlayerList";

function Room({ room, players, setPlayers, deck, setDeck, isHost, onBack }) {
	const navigate = useNavigate();
	
	const MAX_PLAYERS = 4;
	
	const totalPlayers = players.length;
	const botCount = players.filter(p => p.type === "bot").length;
	
	const canAddBot = totalPlayers < MAX_PLAYERS;
	const canRemoveBot = botCount > 0;
	const canStart = players.length >= 2;

	const addBot = () => {
		setPlayers([...players, { name: "Bot", type: "bot" }]);
	};

	const removeBot = () => {
		const index = players.map(p => p.type).lastIndexOf("bot");
		if (index === -1) return;

		setPlayers(players.filter((_, i) => i !== index));
	};

	return (
		<div className="flex flex-col gap-4">
			<h2 className="text-2xl text-center font-bold">
				ROOM {room.code}
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

					<DeckSelector deck={deck} setDeck={setDeck} />
				
					<Button disabled={!canStart} onClick={() => navigate("/game")}>
						START
					</Button>
				</>
			)}

			{!isHost && (
				<Button onClick={() => navigate("/game")}>
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