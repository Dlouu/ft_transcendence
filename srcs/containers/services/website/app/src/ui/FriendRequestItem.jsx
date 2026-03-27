import { Button } from "../ui";

function FriendRequestItem({ username, onAccept, onDecline }) {
	return (
		<div className="flex items-center justify-between gap-4">
			<span className="font-pixel px-2 text-purple-300 font-bold text-xl">{username}</span>
			<div className="flex gap-2">
				<Button variant="iconFriend" onClick={onAccept}>✔</Button>
				<Button variant="iconFriend" onClick={onDecline}>✖</Button>
			</div>
		</div>
	);
}

export default FriendRequestItem;