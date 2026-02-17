import { useState } from "react";
import { Button, Input, EditableField } from "../../ui";
import { useNotifications } from "../../context/AlertContext";

function PasswordSection() {
	const { notify } = useNotifications();
	const [password, setPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isChangingPassword, setIsChangingPassword] = useState(false);

	const handleChangePassword = async () => {
		if (newPassword !== confirmPassword) {
			notify("Passwords do not match", "error");
			return;
		}

		try {
			const request = await fetch("/api/user/update_password", {
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				method: "POST",
				body: JSON.stringify({
					password: password,
					new_password: newPassword
				}),
			});

			const contentType = request.headers.get("content-type") || "";
			const answer = contentType.includes("application/json")
				? await request.json()
				: await request.text();

			if (request.ok) {
				notify("Password changed", "success")
				setIsChangingPassword(false);
			} else {
				const message =
					typeof answer === "string"
						? answer
						: answer?.message || "Update failed";
				notify(message, "error");
			}
		} catch (error) {
			console.log(error);
			notify("Error", "error");
		}
	};

	return (
		<>
			{!isChangingPassword ? (
				<Button onClick={() => setIsChangingPassword(true)}>
					CHANGE PASSWORD
					</Button>
			) : (
				<div className="flex flex-col gap-2">
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
						<Button onClick={handleChangePassword}>
							SAVE
						</Button>
						<Button
							variant="secondary"
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
