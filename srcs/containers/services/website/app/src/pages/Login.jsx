import { useContext, useState, useRef } from "react";
import { Button, Page, Input, Card } from "../ui";
import { AuthContext } from "../context/AuthContext";
import { GameContext } from "../context/GameContext";
import { useApi } from "../hooks/useApi";
import { Link } from "react-router-dom";

function Login() {
	const { login } = useContext(AuthContext);
	const { playerName, setPlayerName } = useContext(GameContext);
	const { patch, loading } = useApi();
	const [password, setPassword] = useState("");
	const passwordRef = useRef(null);

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			await patch("/api/auth/login", {
				"login_email": playerName,
				password,
			});

			await login();

		} catch (error) {
			return;
		}
	};

	return (
		<Page center>
			<Card center>
				<h2 className="text-2xl font-pixelm font-bold mb-6 text-center">
					LOGIN
				</h2>

				<form className="w-full text-center" onSubmit={handleSubmit}>
					<Input
						placeholder="username or email"
						value={playerName}
						onChange={(e) => setPlayerName(e.target.value)}
						autocomplete="username"
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								passwordRef.current?.focus();
							}
						}}
					/>

					<Input
						placeholder="password"
						autocomplete="current-password"
						value={password}
						type="password"
						onChange={(e) => setPassword(e.target.value)}
					/>

					<Button type="submit" disabled={!playerName || !password || loading}>
						LET'S PLAY
					</Button>
					<div className="flex flex-col justify-center items-center">
						<p className="mt-10">
							no account ?
							<Link className="text-purple-300 font-bold p-2" to="/register">
								register
							</Link>
						</p>
					</div>
				</form>
			</Card>
		</Page>
	);
}

export default Login;
