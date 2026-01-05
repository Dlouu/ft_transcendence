import { useEffect, useContext } from "react";
import { GameContext } from "../context/GameContext";
import { Button, Page } from "../ui";

function Game({ onQuit }) {
	const { playerName, gameState, socket } = useContext(GameContext);

	useEffect(() => {
		console.log("Game mounted for", playerName);
		//init canvas ici

		return () => {
			console.log("Game unmounted");
		};
	}, [playerName]);

	return (
		<Page center>
			<h2 className="text-3xl font-bold mb-6">UNO Game</h2>
			<p className="mb-4 text-purple-400">Player: {playerName}</p>

			<div className="w-full max-w-4xl aspect-[4/3] border border-gray-700">
				{/* Le canvas de Yohann ici */}
			</div>
			{/* <pre>{JSON.stringify(gameState, null, 2)}</pre> */}

			<Button variant="secondary" onClick={onQuit}>
				QUIT
			</Button>
		</Page>
	);
}

export default Game;
