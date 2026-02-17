import { Button } from "../../ui";
import { useNavigate } from "react-router-dom";
import img from "../../assets/default-back.png"

function AvatarSection({ user }) {
	const navigate = useNavigate();

	return (
		<div className="grid grid-cols-2">
			<div className="flex flex-col gap-2">
				<p className="font-pixelhb font-bold">
					Avatar:
				</p>
				<img
					src={user?.profile_picture_url}
					className="h-34 w-34 rounded"
					alt={user?.username}
				/>
				<Button variant="icon">
					󱇤
				</Button>
			</div>

			<div className="flex flex-col gap-2">
				<p className="font-pixelhb font-bold">
					Card's back:
				</p>
				<img
					src={img}
					className="h-34 w-22 rounded"
					alt="Card back"
				/>
				<Button variant="icon" onClick={() => navigate("/gallery")}>
					󱇤
				</Button>
			</div>

		</div>
	);
}

export default AvatarSection;
