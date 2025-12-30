function Game({ onQuit }) {
	return (
		<div>
			<h2>UNO Game</h2>

			<p>Game canvas here</p>

			<button onClick={onQuit}>
				QUIT
			</button>
		</div>
	);
}

export default Game;
