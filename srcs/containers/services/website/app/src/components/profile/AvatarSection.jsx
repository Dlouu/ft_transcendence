import { Button } from "../../ui";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import img from "../../assets/default-back.png"

function AvatarSection({ user, readOnly }) {
	const navigate = useNavigate();
	const fileInputRef = useRef(null);
	const { updateProfilePicture } = useUser();

const handleChangeAvatar = async (e) => {
	const file = e.target.files[0];
	if (!file) return;

	try {
		await updateProfilePicture(file);

	} catch (error) {
		console.error(error);
	}

};

	return (
		<div className="grid grid-cols-2">
			<div className="flex flex-col gap-2">
				<p className="font-pixelhb font-bold">
					Avatar:
				</p>
				<img
					src={user?.profile_picture_url ?? "/default-avatar.png"}
					className="h-34 w-34 rounded"
					alt={user?.username}
				/>
				{ !readOnly && (
					<>
						<input
							type="file"
							accept="image/*"
							ref={fileInputRef}
							className="hidden"
							onChange={handleChangeAvatar}
						/>
						<Button
							variant="icon"
							onClick={() => fileInputRef.current.click()}
						>
							󱇤
						</Button>
					</>
				)}
			</div>

			<div className="flex flex-col gap-2">
				<p className="font-pixelhb font-bold">
					Card's back:
				</p>
				<img
					src={user?.card_back_id || img}
					className="h-34 w-22"
					alt="Card back"
				/>
				{ readOnly || (
					<Button variant="icon" onClick={() => navigate("/gallery")}>
						󱇤
					</Button>
				)}
			</div>

		</div>
	);
}

export default AvatarSection;
