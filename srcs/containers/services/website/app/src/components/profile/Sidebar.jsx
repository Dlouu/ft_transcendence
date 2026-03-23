import GameStats from "./GameStats";
import Friendlist from "./Friendlist";

function Sidebar({ profile, readOnly }) {
	return (
		<div className="flex flex-col">
			<GameStats stats={profile.stats}/>
			{!readOnly && <Friendlist />}
		</div>
	);
}

export default Sidebar;