import { useEffect } from "react";

function Game({ playerName, onQuit }) {
	useEffect(() => {
		console.log("Game mounted for", {playerName});
		//init canvas ici

		return () => {
			console.log("Game unmounted");
		};
	}, [playerName]);

	return (
		<div className="game">
			<h2>UNO Game</h2>
			<p>Player: {playerName}</p>

			<div id="uno-canvas-container" className="canvas-container">
				{/* Le canvas de Yohann ici */}
			</div>

			<button onClick={onQuit}>
				QUIT
			</button>
		</div>
	);
}

export default Game;
