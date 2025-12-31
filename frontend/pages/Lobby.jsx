function Lobby({ playerName, onStartGame, onBack }) {
	return (
		<div>
			<h2>Lobby</h2>

			<p>Welcome {playerName}</p>
			<p>Waiting for players...</p>

			<button onClick={onBack}>
				BACK
			</button>

			<button onClick={onStartGame}>
				START GAME
			</button>
		</div>
	);
}

export default Lobby;