import { useState } from "react";

function Home({ onStart }) {
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	return (
		<div>
			<h2>Home</h2>
	
			<button onClick={onStart}>
				START GAME
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
