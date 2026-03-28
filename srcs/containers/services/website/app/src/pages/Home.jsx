import { Card, Page } from "../ui";
import GameSetup from "../components/game/GameSetup";

function Home() {
	return (
		<Page center>
			<Card>
				<h2 className="text-center text-xl font-pixelm font-bold mb-4">
					LOBBY
				</h2>

				<GameSetup />

			</Card>
		</Page>
	);
}

export default Home;
