import { useState, useContext } from "react";
import { Button, Input } from "../../ui";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";

function Lobby({ onCreate, onJoin }) {
	const [code, setCode] = useState("");
	const { user } = useContext(AuthContext);
	const normalizedCode = code.toUpperCase();
	const isValid = normalizedCode.length === 4;

	const handleJoin = () => {
		if (isValid) onJoin(normalizedCode);
	};

	return (
		<>
			<div className="flex flex-col">
				
				<div className="flex flex-col sm:flex-row justify-center mb-5">
					<Button onClick={() => onCreate(normalizedCode)}>
						CREATE A NEW ROOM
					</Button>
				</div>

				<div className="flex flex-col sm:flex-row justify-center gap-5">
					<div>
						<Input
						placeholder="ROOM CODE"
						maxLength={4}
						value={normalizedCode}
						onChange={(e) =>
							setCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))
						}
						className="text-center tracking-widest text-lg"
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								handleJoin();
							}
						}}
					/>
					</div>
					<div>
					<Button variant="login" onClick={handleJoin} disabled={!isValid}>
						JOIN
					</Button>
					</div>
					
				</div>
				<p className="text-center mt-5">
					You are logged as <Link to="/me">{user?.username}</Link>
				</p>
			</div>
		</>
	);
}

export default Lobby;


