import { Link } from "react-router-dom";
import { useContext } from "react";
import { GameContext } from "../context/GameContext";
import Login from "./Login";

function Navbar() {
	const { playerName } = useContext(GameContext);

	return (
		<nav className="bg-gray-800 px-4 py-3 flex items-center justify-between">

			<Link to="/" className="text-lg font-bold text-purple-500">
				UNO
			</Link>

			<div className="hidden sm:flex items-center gap-6">

				<Link to="/lobby" className="hover:text-purple-400">
					Play
				</Link>

				<Link to="/gallery" className="hover:text-purple-400">
					Customize
				</Link>

				<Link to="/profile" className="hover:text-purple-400">

					{playerName && (
						<span>
							{playerName}
						</span>
					)}
					
				</Link>

				<Login />

			</div>

		</nav>
	);
}

export default Navbar;