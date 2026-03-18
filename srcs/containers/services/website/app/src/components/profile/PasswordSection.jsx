import { useState } from "react";
import { Button, Input } from "../../ui";
import { useNotifications } from "../../hooks/useNotifications";
import { useUser } from "../../hooks/useUser";

function PasswordSection() {
	const { notify } = useNotifications();
	const { changePassword } = useUser();
	const [password, setPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isChangingPassword, setIsChangingPassword] = useState(false);

	const handleChangePassword = async () => {
		if (newPassword === password) {
			notify("New password must be different from old password", "error");
			return;
		}
		if (newPassword !== confirmPassword) {
			notify("New password doesn't match", "error");
			return;
		}
		changePassword(password, newPassword);
	};

	return (
		<>
			{!isChangingPassword ? (
				<Button onClick={() => setIsChangingPassword(true)}>
					CHANGE PASSWORD
				</Button>
			) : (
				<div className="flex flex-col gap-2">
					<Button onClick={() => setIsChangingPassword(false)}>
						CHANGE PASSWORD
					</Button>

					<Input
						type="password"
						variant="oneline"
						placeholder="Old password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>

					<Input
						type="password"
						variant="oneline"
						placeholder="New password"
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
					/>

					<Input
						type="password"
						variant="oneline"
						placeholder="Confirm new password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
					/>

					<div className="flex gap-2">
						<Button variant="password" onClick={handleChangePassword}>
							SAVE
						</Button>
						<Button
							variant="password"
							onClick={() => {
								setIsChangingPassword(false);
								setPassword("");
								setNewPassword("");
								setConfirmPassword("");
							}}
						>
							CANCEL
						</Button>
					</div>
				</div>
			)}
		</>
	);
}

export default PasswordSection;
