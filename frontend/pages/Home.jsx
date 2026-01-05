import { useContext, useState } from "react";
import { GameContext } from "../context/GameContext";
import { Button, Page, Input, Card, Login } from "../ui";

function Home({ onStart }) {
	const {playerName, setPlayerName } = useContext(GameContext);
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	const handleJoin = async () => {
		const response = await fetch("http://localhost:5173/", {
			method: "GET",
		});
		// const response = await fetch("http://localhost:3000/api/player", {
		// 	method: "POST",
			// headers: {
			// 	"Content-Type": "application/json",
			// },
			// body: JSON.stringify({ name: playerName }),
		// });

		const data = await response.json();
		console.log(data);

		onStart();
	};

	return (

	<Page center>
		<Login/>
		<Card>
			<h2 className="text-2xl font-bold mb-6 text-center">UNO</h2>
			
			<Input
				placeholder="Your name"
				value={playerName}
				onChange={(e) => setPlayerName(e.target.value)}
			/>

			<div>
				<Button onClick={onStart} disabled={!playerName}>
					LET'S PLAY
				</Button>
			</div>
			
			<Button variant="secondary" onClick={handleJoin}>
				TEST pour FETCH plus tard
			</Button>
		</Card>
	</Page>
	);
}

export default Home;
