import { useContext } from "react";
import { GameContext } from "../context/GameContext";
import { Button, Card, Page } from "../ui";
import { useNavigate } from "react-router-dom";

function Profile() {
	const { profile } = useContext(GameContext);
	const navigate = useNavigate();

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

				<div className="flex flex-col sm:flex-row gap-4">
					<Button onClick={() => navigate("/")}>
						BACK
					</Button>
				</div>

			</Card>
		</Page>
	);
}

export default Profile;

//avatars, usernames, friends list