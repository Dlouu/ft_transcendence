import { Button } from ".";
import { Link } from "react-router-dom";

function FriendName({ id, username, onDelete, onClose }) {
	return (
		<div className="flex items-center justify-between">
		<div className="flex items-center">
			{/* <span className="font-icon text-pink-500 mb-4">󰝥</span> */}
			<span className="font-icon text-green-500">󰊗</span>
			<Link to={`profile/${id}`} onClick={onClose}>
				<span className="font-pixel px-2 text-purple-400 font-bold text-xl">{username}</span>
			</Link>
		</div>
		<Button variant="iconFriend" onClick={onDelete}>✖</Button>
		</div>
	);
}

export default FriendName;