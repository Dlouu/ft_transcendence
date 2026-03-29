function PlayerList({ players = [], bots = [] }) {
	return (
		<div className="h-24">
			<ul className="bg-gray-600 rounded py-2 px-5">
				{players.map((p) => (
					<li key={p.id}>
						{p.username} {p.isHost ? "👑" : p.ready ? "✅" : "❌"}
					</li>
				))}
				{bots.map((bot, i) => (
					<li key={i}>
						{bot} 🤖 ✅
					</li>
				))}
			</ul>
		</div>
	);
}

export default PlayerList;
