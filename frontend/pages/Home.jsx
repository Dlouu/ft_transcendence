import { useContext } from "react";
import { GameContext } from "../context/GameContext";
import { useNavigate } from "react-router-dom";
import { Button, Page, Input, Card } from "../ui";

function Home() {
	const {playerName, setPlayerName } = useContext(GameContext);
	const navigate = useNavigate();

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
			<Card>
				<h2 className="text-2xl font-bold mb-6 text-center">UNO</h2>
				
				{/* faire une autre page quand on est log */}

				<Input
					placeholder="Your name"
					value={playerName}
					onChange={(e) => setPlayerName(e.target.value)}
				/>

				<div>
					<Button onClick={() => navigate("/lobby")} disabled={!playerName}>
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
