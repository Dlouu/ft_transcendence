import { useState } from "react";
import { Card, Button, Page } from "../ui";

function GameSetup({ onStart }) {
	const [setup, setSetup] = useState({
		mode: null,		//create / join
		bots: null,		//1,2,3
		players: null,	//1,2,3,4
		roomCode: "",	//4 chars
		theme: null,	//basic, uwu
	});

	const update = (patch) =>
		setSetup((prev) => ({ ...prev, ...patch}));

	if (!setup.mode) {
		return (
			<Page center>
				<Card center>
					<h2 className="text-xl font-bold mb-6">LOBBY</h2>
					<p>choose a mode for your UwUNO room:</p>
					<div className="flex flex-row gap-6">
						<Button onClick={() => update({ mode: "create" })}>
							CREATE
						</Button>
						<Button onClick={() => update({ mode: "join" })}>
							JOIN
						</Button>
					</div>
				</Card>
			</Page>
		);
	}
}

export default GameSetup;
