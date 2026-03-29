import { useContext, useState } from "react";
import { GameContext } from "../context/GameContext";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Card, Page, Input, Button, Tooltip } from "../ui";
import { useApi } from "../hooks/useApi";

function Register() {
		const { login } = useContext(AuthContext);
		const { playerName, setPlayerName } = useContext(GameContext);
		const { post, loading } = useApi();
		const [userEmail, setUserEmail] = useState("");
		const [password, setPassword] = useState("");
		const [passwordCheck, setPasswordCheck] = useState("");
		const isFormValid =
			playerName &&
			userEmail &&
			password &&
			passwordCheck &&
			password === passwordCheck;
		const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await post("/api/auth/registration", {
				"email": userEmail,
				password,
				"username": playerName
			}),

			await login();
			navigate("/");

		} catch {
			return;
		}
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
					<Tooltip message = "characters allowed: letters, digits, '-' and '_'">
						<Input
							placeholder={"choose your username"}
							variant="oneline"
							value={playerName}
							onChange={(e) => setPlayerName(e.target.value)}
						/>
					</Tooltip>

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
					
					<Tooltip
						message = {`
							at least a lowercase, an uppercase,
							a digit and a special character,
							the length must be between 8 and 64 characters
						`}
					>
						<Input
							placeholder={"choose a password"}
							variant="oneline"
							value={password}
							type="password"
							onChange={(e) => setPassword(e.target.value)}
						/>
					</Tooltip>

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
					<Button onClick={handleSubmit} disabled={!isFormValid || loading}>
						REGISTER
					</Button>
				</div>
			</Card>
		</Page>
	);
}

export default Register;
