import { useState } from "react";
import { Button, Input, Card, Page, EditableField } from "../ui";
import FriendRequestItem from "../ui/FriendRequestItem";
import FriendName from "../ui/FriendName";

function Friendlist({ onClose }) {
	const [friendName, setFriendName] = useState("");
	const [isAddingFriend, setIsAddingFriend] = useState(false);
	const [pendingRequests, setPendingRequests] = useState([
		{ id: 1, username: "Tartempion" },
		{ id: 2, username: "Zoltar42" },
	]);
	const [FriendList, setFriendList] = useState([
		{ id: 1, username: "NumeroUno" },
		{ id: 2, username: "Bwoop" },
		{ id: 3, username: "NilsLeVrai" },
		{ id: 4, username: "Yvharos" },
		{ id: 5, username: "zizian" },
		{ id: 6, username: "_ploup666" },
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
						{FriendList.map((frnd) => (
							<FriendName
								key={frnd.id}
								id={frnd.id}
								username={frnd.username}
								onDelete={() => handleDelete(frnd.id)}
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
