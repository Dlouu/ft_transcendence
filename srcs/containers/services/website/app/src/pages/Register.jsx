import { useContext, useState, useRef } from "react";
import { GameContext } from "../context/GameContext";
import { AuthContext } from "../context/AuthContext";
import { Card, Page, Input, Button } from "../ui";

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
	
		const handleSubmit = async (e) => {
		e.preventDefault();
		await login(playerName, userEmail, password, passwordCheck);
	  };

	return (
		<Page center>
			<Card>
				<h2 className="text-center font-pixel text-xl font-bold mb-4">
					NEW ACCOUNT
				</h2>

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