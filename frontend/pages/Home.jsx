import { useContext, useState } from "react";
import { GameContext } from "../context/GameContext";

function Home({ onStart, onProfile }) {
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
		<div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white px-4">
			<h2 className="text-3xl font-bold mb-6">Home</h2>
			
			<h1>UNO</h1>
			<input
				className="w-full max-w-xs px-4 py-2 mb-4 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
				type="text"
				placeholder="Your name"
				value={playerName}
				onChange={(e) => setPlayerName(e.target.value)}
			/>

			<button
				onClick={onStart}
				className="w-full max-w-xs bg-red-600 hover:bg-red-700 disabled:opacity-50 py-2 rounded font-semibold"
				disabled={!playerName}
				>
				LET'S PLAY
			</button>

			{isLoggedIn ? (
				<p>
					<button onClick={() => setIsLoggedIn(false)}>
						DISCONNECT
					</button>
				<b> Connected !</b>
				</p>
			) : (
				<p><button onClick={() => setIsLoggedIn(true)}>
					LOG IN
				</button><br />
				</p>
			)}

			<button onClick={handleJoin}>
				TEST pour FETCH plus tard
			</button><br /><br />

		</div>
	);
}

export default Home;
