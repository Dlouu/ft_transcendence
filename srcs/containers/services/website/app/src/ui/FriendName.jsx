import { Button } from ".";
import { Link } from "react-router-dom";

function FriendName({ id, username, online, inGame, onDelete, onClose }) {
	const statusIcon = inGame
	? <span className="font-icon text-green-500">󰊗</span>
	: online
	? <span className="font-icon text-pink-500">󰝥</span>
	: <span className="font-icon text-gray-500">󰝥</span>

	return (
		
		<div className="flex items-center justify-between">
		<div className="flex items-center">
			{ statusIcon }
			<Link to={`/profile/${id}`} onClick={onClose}>
				<span className="font-pixel px-2 text-purple-400 font-bold text-xl">{username}</span>
			</Link>
		</div>
		<Button variant="iconFriend" onClick={onDelete}>✖</Button>
		</div>
	);
}

export default FriendName;
