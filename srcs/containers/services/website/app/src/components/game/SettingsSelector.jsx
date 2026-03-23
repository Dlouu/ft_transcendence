import { useContext } from "react";
import { LobbyContext } from "../../context/LobbyContext";

function SettingsSelector() {
	const { theme, setTheme } = useContext(LobbyContext);
	const { privacy, setRoomPrivacy } = useContext(LobbyContext);

	return (
		<>
			<div className="flex flex-row gap-4">Select Theme
				<label>
					<input
						type="radio"
						checked={!theme}
						onChange={() => setTheme(false)}
					/>
					Basic
				</label>

				<label>
					<input
						type="radio"
						checked={theme}
						onChange={() => setTheme(true)}
					/>
					UwU
				</label>
			</div>

			<div className="flex flex-row gap-4">Select Privacy
				<label>
					<input
						type="radio"
						checked={!privacy}
						onChange={() => setRoomPrivacy(false)}
					/>
					Public
				</label>

				<label>
					<input
						type="radio"
						checked={privacy}
						onChange={() => setRoomPrivacy(true)}
					/>
					Private
				</label>
			</div>
		</>
	);
}

export default SettingsSelector;