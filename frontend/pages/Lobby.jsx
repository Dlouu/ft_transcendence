import { useContext } from "react";
import { GameContext } from "../context/GameContext";

function Lobby({ onStartGame, onBack, onProfile }) {
	const { playerName } = useContext(GameContext);
	return (
		<div className="min-h-screen bg-gray-900 text-white p-6">
			<h2 className="text-2xl font-bold mb-4">Lobby</h2>

			<p className="mb-6">Welcome {playerName}</p>
			<p>Waiting for players...</p>

			<div className="flex flex-col sm:flex-row gap-4">
				<button
					onClick={onBack}
					className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
				>
					BACK
				</button>

				<button
					onClick={onStartGame}
					className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
				>
					START GAME
				</button>

				<button
					onClick={(onProfile)}
					disabled={!playerName}
					className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
				>
					PROFILE
				</button>
			</div>
		</div>
	);
}

export default Lobby;