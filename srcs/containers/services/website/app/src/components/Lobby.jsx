import { useState } from "react";
import { Button, Input } from "../ui";

function Lobby({ onCreate, onJoin }) {
	const [code, setCode] = useState("");
	const normalizedCode = code.toUpperCase();
	const isValid = normalizedCode.length === 4;

	return (
		<>
			<div className="flex flex-col">
				<p className="text-center font-bold mb-2">Start a new game</p>
				<Input
					placeholder="ROOM CODE (4 letters)"
					maxLength={4}
					value={normalizedCode}
					onChange={(e) =>
						setCode(e.target.value.replace(/[^a-zA-Z]/g, ""))
					}
					className="text-center tracking-widest text-lg"
				/>
			</div>

			<div className="flex flex-col sm:flex-row justify-center sm:gap-5">
				<Button onClick={() => onCreate(normalizedCode)} disabled={!isValid}>
					CREATE
				</Button>

				<Button onClick={() => onJoin(normalizedCode)} disabled={!isValid}>
					JOIN
				</Button>
			</div>
		</>
	);
}

export default Lobby;


