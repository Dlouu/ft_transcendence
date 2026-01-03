import { useContext, useState } from "react";
import { GameContext } from "../context/GameContext";

function Profile({ onProfile, onBack }) {
	const { profile } = useContext(GameContext);

	console.log(profile);

	return (
		<div className="min-h-screen bg-gray-900 text-white p-6">
			<h2 className="text-2xl font-bold mb-4">{profile.name}'s profile</h2>

			<ul className="space-y-2">
				<li>Games played: {profile.stats.gamesPlayed}</li>
				<li>Games won: {profile.stats.gamesWon}</li>
				<li>Win rate: {profile.stats.winRate}%</li>
			</ul>

			<button
				onClick={onBack}
				className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
			>
				BACK
			</button>
		</div>
	);
}

export default Profile;