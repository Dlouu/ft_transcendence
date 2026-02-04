function PlayerList({ players }) {
	return (
		<div className="h-24">
			<ul className="bg-gray-600 rounded py-2 px-5">
				{players.map((p, i) => (
					<li key={i}>
						{p.name} {p.type === "bot" && "🤖"}
					</li>
				))}
			</ul>
		</div>
	);
}

export default PlayerList;