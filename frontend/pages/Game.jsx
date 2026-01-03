import { useEffect, useContext } from "react";
import { GameContext } from "../context/GameContext";

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
		<div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white px-4">
			<h2 className="text-3xl font-bold mb-6">UNO Game</h2>
			<p>Player: {playerName}</p>

			<div className="w-full max-w-4xl aspect-[4/3] border border-gray-700">
				{/* Le canvas de Yohann ici */}
			</div>
			{/* <pre>{JSON.stringify(gameState, null, 2)}</pre> */}

			<button
				onClick={onQuit}
				className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
			>
				QUIT
			</button>
		
		</div>
	);
}

export default Game;
