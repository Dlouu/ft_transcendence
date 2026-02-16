import { useContext } from "react";
import { GameContext } from "../context/GameContext";
import { Button, Card, Page } from "../ui";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Me() {
	const { user } = useContext(AuthContext);
	const { profile } = useContext(GameContext);
	const navigate = useNavigate();

	return (
		<Page center>
			<Card>

				<h2 className="text-2xl font-pixelm font-bold mb-2">
					{user?.username}
				</h2>
				<span>Email: {user?.email}</span>
				<img
					src={user?.profile_picture_url}
					className="h-30 w-30"
					alt={user?.username}
				/>

				<h1 className="font-bold text-xl">Statistics</h1>
				<ul className="space-y-1">
					<li>Games played: {profile.stats.gamesPlayed}</li>
					<li>Games won: {profile.stats.gamesWon}</li>
					<li>Win rate: {profile.stats.winRate}%</li>
				</ul>

				<p className="font-bold text-purple-300">Gallery a ajouter</p>

				<div className="flex flex-col sm:flex-row gap-4">
					<Button onClick={() => navigate(-1)}>
						BACK
					</Button>
				</div>

			</Card>
		</Page>
	);
}

export default Me;

//avatars, usernames, friends list