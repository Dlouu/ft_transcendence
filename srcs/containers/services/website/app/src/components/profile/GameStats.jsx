function GameStats({ stats }) {
	return (
		<div>
			<h2 className="text-2xl font-pixel font-bold mt-6 sm:mt-0 mb-2">GAME STATISTICS</h2>
			<ul className="space-y-1">
				<li>Win rate:		{stats.winRate}%</li>
				<li>Games played:	{stats.gamesPlayed}</li>
				<li>Games won:		{stats.gamesWon}</li>
				<li>Uno! count:		{stats.unoCount}</li>
				<li>UwU! count:		{stats.uwuCount}</li>
				<li>Plus 4 count:	{stats.plus4count}</li>
				<li>Cards drew:		{stats.cardsDrew}</li>
				<li>Biggest hand:	{stats.biggestHand}</li>
			</ul>
		</div>
	);
}

export default GameStats;