import { useContext } from "react";
import { GameContext } from "../context/GameContext";
import { AuthContext } from "../context/AuthContext";
import { Button, Page, Input, Card } from "../ui";

function Login() {
	const { login } = useContext(AuthContext);
	const { playerName, setPlayerName } = useContext(GameContext);

	const handleLogin = () => {
		login(playerName);
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
				<h2 className="text-2xl font-bold mb-6 text-center">
					LOGIN
				</h2>

				<Input
					placeholder="Your name"
					value={playerName}
					onChange={(e) => setPlayerName(e.target.value)}
				/>

					<Button onClick={handleLogin} disabled={!playerName}>
						LET'S PLAY
					</Button>
			</Card>

			{/* <Button variant="secondary" onClick={handleJoin}>
				TEST pour FETCH plus tard
			</Button> */}
		</Page>
	);
}

export default Login;
