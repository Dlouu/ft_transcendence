import { useState } from "react";
import { Button, Input } from "../../ui";
import { useNotifications } from "../../context/AlertContext";

function DeleteAccount({ profile }) {
	const { notify } = useNotifications();
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [isDeletingAccount, setIsDeletingAccount] = useState(false);

	const deleteUserAccount = async (e) => {
		e.preventDefault();

		if (!password) {
			notify("You didn't type your password", "error");
			return;
		}
		if (confirm !== "DELETE"){
			notify("You didn't type DELETE", "error");
			return;
		}

		try {
			const request = await fetch("/api/user/delete_account", {
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				method: "POST",
				body: JSON.stringify({
					"password": password
				}),
			});

			const contentType = request.headers.get("content-type") || "";
			const answer = contentType.includes("application/json")
				? await request.json()
				: await request.text();

			if (request.ok) {
				notify("Account deleted", "success")
				logout();
			} else {
				const message =
					typeof answer === "string"
						? answer
						: answer?.message || "Login failed";
				notify(message, "error");
			}
		} catch (error) {
			console.log(error);
			notify("Error", "error");
		}
	};

	return (
		<div>	
			{!isDeletingAccount ? (
				<Button variant="secondary" onClick={() => setIsDeletingAccount(true)}>
					DELETE ACCOUNT
					</Button>
			) : (
				<div className="flex flex-col gap-2 mt-4">
					<Input
						type="password"
						placeholder="Type your password"
						value={password}
						variant="oneline"
						onChange={(e) => setPassword(e.target.value)}
					/>

					<Input
						type="text"
						placeholder='Type "DELETE"'
						value={confirm}
						variant="oneline"
						onChange={(e) => setConfirm(e.target.value)}
					/>

					<div className="flex gap-2">
						<Button onClick={deleteUserAccount}>
							DELETE
						</Button>
						<Button
							variant="secondary"
							onClick={() => {
								setIsDeletingAccount(false);
								setPassword("");
								setConfirm("");
							}}
						>
							OH PLZ NO
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

export default DeleteAccount;



















