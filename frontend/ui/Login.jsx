import Button from "./Button";
import { useContext, useState } from "react";
import { GameContext } from "../context/GameContext";

function Login() {
	const {playerName, setPlayerName } = useContext(GameContext);
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	return (
		<div>
			{isLoggedIn ? (
				<>
					<div>
						<p>
							<Button variant="secondary" onClick={() => setIsLoggedIn(false)}>
								DISCONNECT
							</Button>
						</p>
					</div>

					<div className="text-center">
						<p>
							Logged as {playerName}
						</p>
					</div>
				</>
			) : (
				<>
					<div>
						<p>
							<Button variant="success" onClick={() => setIsLoggedIn(true)}>
								SIGN IN
							</Button>
						</p>
					</div>

					<div className="text-center">
						<p>
							Not logged
						</p>
					</div>
				</>
			)}
		</div>
	);
}

export default Login;