import { useContext } from "react";
import { GameContext } from "../context/GameContext";
import { Card, Page, Button, Login } from "../ui";

function Lobby({ onStartGame, onBack, onProfile }) {
	const { playerName } = useContext(GameContext);
	return (

		<Page center>
			<Login/>
			<Card>
				<h2 className="text-2xl font-bold mb-4">Lobby</h2>

				<p className="mb-6">Welcome {playerName}</p>
				<p>Waiting for players...</p>

				<div className="flex flex-col sm:flex-row gap-4">
					<Button onClick={onBack} variant="secondary">
						BACK
					</Button>

					<Button onClick={onStartGame} variant="success">
						START GAME
					</Button>

					<Button onClick={(onProfile)} disabled={!playerName}>
						PROFILE
					</Button>
				</div>
			</Card>
		</Page>
	);
}

export default Lobby;