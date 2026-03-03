import { useState } from "react";
import { Button, Input } from "../../ui";
import { useNotifications } from "../../context/AlertContext";
import { useUser } from "../../hooks/useUser";

function DeleteAccount({ profile }) {
	const { notify } = useNotifications();
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [isDeletingAccount, setIsDeletingAccount] = useState(false);
	const { deleteAccount } = useUser();

	const deleteUserAccount = async (e) => {
		e.preventDefault();

		if (!password) {
			notify("You didn't type your password", "error");
			return;
		}
		if (confirm !== "DELETE") {
			notify("You didn't type DELETE", "error");
			return;
		}

		await deleteAccount(password);
	};

	return (
		<>	
			{!isDeletingAccount ? (
				<Button variant="red" onClick={() => setIsDeletingAccount(true)}>
					DELETE ACCOUNT
				</Button>
			) : (
				<div className="flex flex-col gap-2">
					<Button variant="red" onClick={() => setIsDeletingAccount(false)}>
						DELETE ACCOUNT
					</Button>

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
						<Button variant="password" onClick={deleteUserAccount}>
							DELETE
						</Button>
						<Button
							variant="password"
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
		</>
	);
}

export default DeleteAccount;



















