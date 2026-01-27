import { useContext, useState, useRef } from "react";
import { GameContext } from "../context/GameContext";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Button, Page, Input, Card } from "../ui";
import imageLog42 from "../assets/42login.svg"

function Login() {
	const { login } = useContext(AuthContext);
	const { playerName, setPlayerName } = useContext(GameContext);
	const [password, setPassword] = useState("");
	const passwordRef = useRef(null);

	const handleLogin = () => {
		login(playerName);
	};

	const handleSubmit = async (e) => {
    e.preventDefault();
    await login(playerName, password);
  };

	// const handleJoin = async () => {
	// 	const response = await fetch("http://localhost:5173/", {
	// 		method: "GET",
	// 	});
	// 	const response = await fetch("http://localhost:3000/api/player", {
	// 		method: "POST",
	// 		headers: {
	// 			"Content-Type": "application/json",
	// 		},
	// 		body: JSON.stringify({ name: playerName }),
	// 	});

	// 	const data = await response.json();
	// 	console.log(data);

	// 	onStart();
	// };

	return (
		<Page center>
			<Card center>
				<h2 className="text-2xl font-pixel font-bold mb-6 text-center">
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

					<Button onClick={handleLogin} disabled={!playerName || !password}>
						LET'S PLAY
					</Button>
					<div className="flex flex-col justify-center items-center">
						<Link className="flex flex-row gap-2 py-5" to="/register">
							sign in with <img src={imageLog42} className="h-6"/>
						</Link>
						<p>
							no account ?
							<Link className="text-purple-300 font-bold p-2" to="/register">
								register
							</Link>
						</p>

					</div>
				</form>
			</Card>

			{/* <Button variant="secondary" onClick={handleJoin}>
				TEST pour FETCH plus tard
			</Button> */}
		</Page>
	);
}

export default Login;
