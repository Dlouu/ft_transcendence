import { useContext } from "react";
import { LobbyContext } from "../../context/LobbyContext";


function ThemeSelector() {
	const { theme, setTheme } = useContext(LobbyContext);

	return (
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
	);
}

export default ThemeSelector;