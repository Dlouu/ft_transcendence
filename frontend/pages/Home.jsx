import { useState } from "react";

function Home({ onStart, playerName, setPlayerName }) {
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	return (
		<div>
			<h2>Home</h2>
	
			<input
				type="text"
				placeholder="Your name"
				value={playerName}
				onChange={(e) => setPlayerName(e.target.value)}
			/>

			<button onClick={onStart} disabled={!playerName}>
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

		</div>
	);
}

export default Home;
