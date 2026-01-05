import { useContext } from "react";
import { GameContext } from "../context/GameContext";
import { Button, Card, Page } from "../ui";

function Profile({ onBack }) {
	const { profile } = useContext(GameContext);

	return (
		<Page center>
			<Card>
				<h2 className="text-2xl font-bold mb-4">
					{profile.name}'s profile
				</h2>

				<ul className="space-y-2">
					<li>Games played: {profile.stats.gamesPlayed}</li>
					<li>Games won: {profile.stats.gamesWon}</li>
					<li>Win rate: {profile.stats.winRate}%</li>
				</ul>

				<Button onClick={onBack}>
					BACK
				</Button>
			</Card>
		</Page>
	);
}

export default Profile;