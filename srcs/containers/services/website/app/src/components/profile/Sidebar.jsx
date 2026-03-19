import GameStats from "./GameStats";
import Friendlist from "./Friendlist";

function Sidebar({ profile }) {
	return (
		<div className="flex flex-col">
			<GameStats stats={profile.stats}/>
			<Friendlist />
		</div>
	);
}

export default Sidebar;