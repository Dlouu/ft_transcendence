import GameStats from "./GameStats";

function Sidebar({ profile }) {
	return (
		<div className="flex flex-col">
			<GameStats stats={profile.stats}/>
		</div>
	);
}

export default Sidebar;