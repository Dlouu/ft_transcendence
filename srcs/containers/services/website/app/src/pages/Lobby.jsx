import { useContext, useEffect } from "react";
import GameSetup from "../components/game/GameSetup";
import { Card, Page } from "../ui";
import { useParams } from "react-router-dom";
import { LobbyContext } from "../context/LobbyContext";

function LobbyPage() {
	const { id } = useParams();
	const { joinLobby, code, connected } = useContext(LobbyContext);

	useEffect(() => {
		if (connected && id && !code) {
			joinLobby(id);
		}
	}, [connected, id]);

	return (
		<Page center>
			<Card>
				<GameSetup />
			</Card>
		</Page>
	);
}

export default LobbyPage;