function Sidebar({ profile }) {
	return (
		<div className="flex flex-col">
			<h2 className="text-2xl font-pixel font-bold mt-6 sm:mt-0 mb-2">STATS</h2>
			<ul className="space-y-1">
				<li>Games played: {profile.stats.gamesPlayed}</li>
				<li>Games won: {profile.stats.gamesWon}</li>
				<li>Win rate: {profile.stats.winRate}%</li>
			</ul>
			
			<h2 className="text-2xl font-pixel font-bold mb-2 mt-12">FRIENDS</h2>
			<ul className="space-y-1">
				<li>Friend-1</li>
				<li>Deuxieme</li>
				<li>Truite</li>
			</ul>
		</div>
	);
}

export default Sidebar;