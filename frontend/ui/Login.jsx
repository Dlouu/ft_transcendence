import Button from "./Button";
import { useState } from "react";

function Login() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	return (
		<div>
			{isLoggedIn ? (
				<div>
					<Button variant="login" onClick={() => setIsLoggedIn(false)}>
						DISCONNECT
					</Button>
				</div>
			) : (
				<div>
					<Button variant="login" onClick={() => setIsLoggedIn(true)}>
						SIGN IN
					</Button>
				</div>
			)}
		</div>
	);
}

export default Login;