import { useContext } from "react";
import { GameContext } from "../context/GameContext";
import { useNavigate } from "react-router-dom";
import { Card, Page, Button } from "../ui";

function Home() {
	const { playerName } = useContext(GameContext);
	const navigate = useNavigate();

	return (
		<Page center>
			<Card>

				<h2 className="text-2xl font-bold mb-4">Lobby</h2>

				<p className="mb-3">Welcome {playerName}</p>
				
				<p className="mb-3">select number of players here</p>

				<p className="mb-3">select theme here</p>

				<p className="mb-3">select deck here</p>

				<div className="flex flex-col sm:flex-row gap-4">
					<Button onClick={() => navigate("/game")} variant="success">
						START GAME
					</Button>

					<Button onClick={() => navigate("/gallery")} variant="primary">
						CUSTOMIZE
					</Button>
				</div>

			</Card>
		</Page>
	);
}

export default Home;
