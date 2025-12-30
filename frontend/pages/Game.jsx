function Game({ onQuit }) {
	return (
		<div className="game">
			<h2>UNO Game</h2>

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
