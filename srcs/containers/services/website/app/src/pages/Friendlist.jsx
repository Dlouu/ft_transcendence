import { useState, useContext } from "react";
import { Button, Input, Card, Page, EditableField } from "../ui";
import FriendRequestItem from "../ui/FriendRequestItem";
import FriendName from "../ui/FriendName";
import { LobbyContext } from "../context/LobbyContext";

function Friendlist({ onClose }) {
	const [friendName, setFriendName] = useState("");
	const [isAddingFriend, setIsAddingFriend] = useState(false);
	const { friends, pendingRequests, addFriend, removeFriend, acceptFriend, rejectFriend } = useContext(LobbyContext);

	const handleAddFriend = () => {
		const trimmed = friendName.trim();
		if (!trimmed)
			return;
		addFriend(trimmed);
		setFriendName("");
		setIsAddingFriend(false);
	};

	const handleAccept = (user_id) => {
		acceptFriend(user_id)
	};

	const handleDecline = (user_id) => {
		rejectFriend(user_id)
	};

	const handleDelete = (username) => {
		removeFriend(username)
	};

	const acceptedFriends = friends.filter(f => f.status === "accepted");
	const pendingSent = friends.filter(f => f.status === "pending");

	return (
		<div
			className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
			onClick={onClose}
		>
			<div onClick={(e) => e.stopPropagation()}>
				<Card
					plain
					className="max-w-xl w-full max-h-[80vh] overflow-y-auto relative"
					onClick={(e) => e.stopPropagation()}
				>
					<button
						className="absolute top-2 right-3 text-2xl"
						onClick={onClose}
					>
						✕
					</button>

					<h2 className="text-2xl font-pixelm sm:px-20 font-bold mb-6 text-center text-shadow-lg">
						FRIENDLIST
					</h2>

					{!isAddingFriend ? (
						<div className="mt-2 mb-6">
							<Button variant="icon2" onClick={() => setIsAddingFriend(true)}>󰀔</Button>
							<span className="px-5 font-pixelm mb-6 text-center text-shadow-lg">ADD FRIEND</span>
						</div>
						) : (
						<div className="mt-2 mb-6 flex items-center gap-2">
							<Input
								type="text"
								variant="oneline"
								placeholder="your friend's username"
								value={friendName}
								onChange={(e) => setFriendName(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleAddFriend()}
							/>
							<Button variant="icon" onClick={handleAddFriend}>✔</Button>
							<Button variant="icon" onClick={() => {
							setIsAddingFriend(false);
							setFriendName("");
							}}>✖</Button>
						</div>
					)}

					{pendingRequests.length > 0 && (
						<div className="mb-4 bg-gray-600 p-2 rounded">
							<p className="font-pixelm font-bold text-shadow-lg text-purple-500 mb-2">
								PENDING REQUESTS:
							</p>
							<ul className="space-y-1">
								{pendingRequests.map((req) => (
									<FriendRequestItem
										key={req.user_id}
										username={req.username}
										onAccept={() => handleAccept(req.user_id)}
										onDecline={() => handleDecline(req.user_id)}
									/>
								))}
							</ul>
						</div>
					)}

					{pendingSent.length > 0 && (
						<div className="mb-4 bg-gray-600 p-2 rounded">
							<p className="font-pixelm font-bold text-shadow-lg text-purple-500 mb-2">
								SENT REQUESTS:
							</p>
							<ul className="space-y-1">
								{pendingSent.map((f) => (
									<li key={f.username} className="font-pixel px-2 text-gray-400 text-xl">
										{f.username}
									</li>
								))}
							</ul>
						</div>
					)}

					<ul className="space-y-1">
						{acceptedFriends.map((frnd) => (
							<FriendName
								key={frnd.username}
								id={frnd.id}
								username={frnd.username}
								online={frnd.online}
								inGame={frnd.in_game}
								onDelete={() => handleDelete(frnd.username)}
								onClose={onClose}
							/>
						))}
						
					</ul>
				</Card>
			</div>
		</div>
	);
}

export default Friendlist;
