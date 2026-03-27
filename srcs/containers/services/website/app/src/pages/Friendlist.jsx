import { useState } from "react";
import { Button, Input, Card, Page, EditableField } from "../ui";
import FriendRequestItem from "../ui/FriendRequestItem";

function Friendlist() {
	const [friendName, setFriendName] = useState("");
	const [isAddingFriend, setIsAddingFriend] = useState(false);
	const [pendingRequests, setPendingRequests] = useState([
		{ id: 1, username: "Tartempion" },
		{ id: 2, username: "Zoltar42" },
	]);

	const handleAddFriend = async () => {
		// TODO: fetch add
	};

	const handleAccept = (id) => {
		setPendingRequests((prev) => prev.filter((r) => r.id !== id));
		// TODO: fetch accept
	};

	const handleDecline = (id) => {
		setPendingRequests((prev) => prev.filter((r) => r.id !== id));
		// TODO: fetch decline
	};

	return (
		<Page center>
			<Card>
				<h2 className="text-2xl font-pixelm font-bold mb-6 text-center text-shadow-lg">
					FRIENDLIST
				</h2>

				{!isAddingFriend ? (
					<div className="mt-2 mb-6">
						<Button variant="icon" onClick={() => setIsAddingFriend(true)}>󰀔</Button>
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
						/>
						<Button variant="icon" onClick={handleAddFriend}>✔</Button>
						<Button variant="icon" onClick={() => {
						setIsAddingFriend(false);
						setFriendName("");
						}}>✖</Button>
					</div>
				)}

				{pendingRequests.length > 0 && (
					<div className="mb-4">
						<p className="font-pixelm font-bold text-shadow-lg text-purple-500 mb-2">
							PENDING REQUESTS:
						</p>
						<ul className="space-y-1">
						{pendingRequests.map((req) => (
							<FriendRequestItem
								key={req.id}
								username={req.username}
								onAccept={() => handleAccept(req.id)}
								onDecline={() => handleDecline(req.id)}
							/>
						))}
						</ul>
					</div>
				)}

				<ul className="space-y-1">
					<li>Friend-1</li>
					<li>Deuxieme</li>
					<li>Truite</li>
				</ul>

			</Card>
		</Page>
	);
}

export default Friendlist;
