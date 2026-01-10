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

			<div className="w-full max-w-4xl aspect-video border border-gray-700">
				{/* Le canvas de Yohann ici */}
			</div>

			{/* <pre>{JSON.stringify(gameState, null, 2)}</pre> */}

			<Button variant="secondary" onClick={() => navigate("/")}>
				QUIT
			</Button>

		</Page>
	);
}

export default Game;
