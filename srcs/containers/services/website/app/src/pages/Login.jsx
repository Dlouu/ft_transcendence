import { useContext, useState, useRef } from "react";
import { GameContext } from "../context/GameContext";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Button, Page, Input, Card } from "../ui";
import imageLog42 from "../assets/42login.svg"
import { useNotifications } from "../context/AlertContext";

function Login() {
	const { login } = useContext(AuthContext);
	const { playerName, setPlayerName } = useContext(GameContext);
	const [password, setPassword] = useState("");
	const passwordRef = useRef(null);
	const { notify } = useNotifications();

	const handleLogin = () => {
		login(playerName);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const request = await fetch("/api/users/login", {
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				method: "PATCH",
				body: JSON.stringify({
					"login_email": playerName,
					"password": password
				}),
			})
			const answer = await request.json();
			if (request.ok) {
				handleLogin();
			}
			else {
				notify(answer.message, "error");
			}
		} catch (error) {
			console.log(error);
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
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								passwordRef.current?.focus();
							}
						}}
					/>

					<Input
						placeholder="password"
						value={password}
						type="password"
						onChange={(e) => setPassword(e.target.value)}
					/>

					<Button onClick={handleSubmit} disabled={!playerName && !password}>
						LET'S PLAY
					</Button>
					<div className="flex flex-col justify-center items-center">
						<a href="http://localhost:5050/oauth/42" className="flex flex-row gap-2 py-5">
							sign in with <img src={imageLog42} className="h-6"/>
						</a>
						<p>
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
