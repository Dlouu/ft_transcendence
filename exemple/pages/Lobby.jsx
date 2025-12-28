function Lobby({ onPlay }) {
	return (
	<div className="screen">
		<h2>Lobby</h2>
		<p>Waiting for players...</p>
		<button onClick={onPlay}>Start Game</button>
	</div>
	);
}

export default Lobby;
