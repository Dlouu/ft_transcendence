import { useEffect, useContext } from "react";
import { GameContext } from "../context/GameContext";
import { Button, Page } from "../ui";
import { useNavigate } from "react-router-dom";

function Game() {
	const { playerName, gameState, socket } = useContext(GameContext);
	const navigate = useNavigate();

	useEffect(() => {
		console.log("Game mounted for", playerName);
		//init canvas ici

		return () => {
			console.log("Game unmounted");
		};
	}, [playerName]);

	return (
		<Page center>

			<h2 className="text-3xl font-bold mb-6 text-shadow-lg">
				UNO Game
			</h2>

			<p className="mb-4 text-purple-400">
				Player: {playerName}
			</p>

			<div className="w-full max-w-4xl aspect-[4/3] border border-gray-700">
				{/* Le canvas de Yohann ici */}
			</div>

			{/* <pre>{JSON.stringify(gameState, null, 2)}</pre> */}

			<Button variant="secondary" onClick={() => navigate("/lobby")}>
				QUIT
			</Button>

		</Page>
	);
}

export default Game;
