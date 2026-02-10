import { useContext, useState } from "react";
import { GameContext } from "../context/GameContext";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Card, Page, Input, Button } from "../ui";
import { useNotifications } from "../context/AlertContext";

function Register() {
		const { login } = useContext(AuthContext);
		const { playerName, setPlayerName } = useContext(GameContext);
		const [userEmail, setUserEmail] = useState("");
		const [password, setPassword] = useState("");
		const [passwordCheck, setPasswordCheck] = useState("");
		const isFormValid =
			playerName &&
			userEmail &&
			password &&
			passwordCheck &&
			password === passwordCheck;
		const { notify } = useNotifications();

		const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const request = await fetch("/api/users/registration", {
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				method: "POST",
				body: JSON.stringify({
					"email": userEmail,
					"password": password,
					"username": playerName
				}),
			})
			const answer = await request.json();
			if (request.ok) {
				handleLogin();
				notify(answer.message, "success");
			}
			else {
				notify(answer.message, "error");
			}
		} catch (error) {
			console.log(error);
		}

		await login(playerName, userEmail, password, passwordCheck);
	};

	return (
		<Page center>
			<Card>
				<h2 className="text-center font-pixelm text-xl font-bold mb-4">
					NEW ACCOUNT
				</h2>

				<p className="flex flex-row justify-center py-2">
					already have an account ?
					<Link className="text-purple-300 px-2 font-bold" to="/">
						sign in
					</Link>
				</p>

				<form className="sm:text-right grid gap-3 grid-cols-1 sm:grid-cols-[auto_1fr]" onSubmit={handleSubmit}>
					<label className="sm:p-2">
						Username
					</label>
					<Input
						placeholder={"letters, digits and _ -"}
						variant="oneline"
						value={playerName}
						onChange={(e) => setPlayerName(e.target.value)}
					/>

					<label className="sm:p-2">
						Email
					</label>
					<Input
						placeholder={"please enter valid email"}
						variant="oneline"
						value={userEmail}
						onChange={(e) => setUserEmail(e.target.value)}
					/>

					<label className="sm:p-2">
						Strong password
					</label>
					<Input
						placeholder={"choose a password"}
						variant="oneline"
						value={password}
						type="password"
						onChange={(e) => setPassword(e.target.value)}
					/>

					<label className="sm:p-2">
						Re-type password
					</label>
					<Input
						variant="oneline"
						placeholder={"type it again"}
						value={passwordCheck}
						type="password"
						onChange={(e) => setPasswordCheck(e.target.value)}
					/>
				</form>

				<div className="flex flex-col items-center">
					<Button onClick={handleSubmit} disabled={!isFormValid}>
						REGISTER
					</Button>
				</div>
			</Card>
		</Page>
	);
}

export default Register;