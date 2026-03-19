import { useState } from "react";
import { Button, Input } from "../../ui";
import GameStats from "./GameStats";

function Sidebar({ profile }) {
	const [friendName, setFriendName] = useState("");
	const [isAddingFriend, setIsAddingFriend] = useState(false);

	const handleAddFriend = async () => {
		console.log("faire le fetch add friend")
	};

	return (
		<div className="flex flex-col">
			<GameStats stats={profile.stats}/>

			<h2 className="text-2xl font-pixel font-bold mb-2 mt-12">FRIENDLIST</h2>
			<ul className="space-y-1">
				<li>Friend-1</li>
				<li>Deuxieme</li>
				<li>Truite</li>
			</ul>

			{!isAddingFriend ? (
				<div className="mt-2">
					<Button variant="icon" onClick={() => setIsAddingFriend(true)}>
						󰀔
					</Button>
				</div>
			) : (
				<div className="mt-2 flex flex-col gap-2">
					<Button variant="icon" onClick={() => setIsAddingFriend(false)}>
						󰀔
					</Button>

					<Input
						type="text"
						variant="oneline"
						placeholder="your friend's username"
						value={friendName}
						onChange={(e) => setFriendName(e.target.value)}
					/>

					<div className="flex gap-2">
						<Button variant="password" onClick={handleAddFriend}>
							ADD
						</Button>
						<Button
							variant="password"
							onClick={() => {
								setIsAddingFriend(false);
								setFriendName("");
							}}
						>
							CANCEL
						</Button>
					</div>
				</div>
			)}

		</div>
	);
}

export default Sidebar;