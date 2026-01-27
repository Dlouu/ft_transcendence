import { Card, Page } from "../ui";
import GameSetup from "../components/GameSetup";

function Home() {
	const handleStart = (setup) => {
		console.log("START GAME", setup);

		// plus tard :
		// socket.emit("create_game", setup)
		// navigate(`/game/${gameId}`)
	};

	return (
		<Page center>
			<Card>
				<h2 className="text-center text-xl font-pixel font-bold mb-4">
					LOBBY
				</h2>

				<GameSetup onStart={handleStart} />

			</Card>
		</Page>
	);
}

export default Home;
