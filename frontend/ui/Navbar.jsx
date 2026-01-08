import { Link, useLocation } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { GameContext } from "../context/GameContext";
import Login from "./Login";

function Navbar() {
	const { playerName } = useContext(GameContext);
	//mettre le playerName quand on est co je sais pas, a revoir
	const [open, setOpen] = useState(false);
	const location = useLocation();

	useEffect(() => {
		setOpen(false);
	}, [location.pathname]);
	//ferme le menu quand on change de page

	const linkClass = (path) =>
		`block px-3 py-2 rounded ${
      location.pathname === path
        ? "bg-gray-600 text-purple-400"
        : "hover:bg-gray-700"
		}`;

	return (
		<nav
			className="
				fixed h-14 top-0 left-0 z-50 w-full
				bg-gray-800 px-4
				flex items-center
				border-b border-gray-700
			"
		>

			<Link to="/" className="text-lg font-bold text-purple-500">
				UNO
			</Link>

		{/* Burger */}
			<button
				className="sm:hidden ml-auto p-2 rounded"
				onClick={() => setOpen(!open)}
				aria-label="Menu"
			>
				☰
			</button>

		{/* Desktop */}
			<div className="hidden sm:flex ml-auto items-center gap-4 font-bold">

				<Link to="/lobby" className={linkClass("/lobby")}>
					PLAY
				</Link>

				<Link to="/gallery" className={linkClass("/gallery")}>
					CUSTOMIZE
				</Link>

				<Link to="/profile" className={linkClass("/profile")}>
					PROFILE
				</Link>

				<Login />

			</div>

		{/* Mobile menu */}
			{open && (
				<div className="fixed inset-0 z-50 bg-gray-800 flex flex-col">
					<div className="flex items-center justify-between p-4 border-b border-gray-700">

						<span className="text-lg font-bold text-purple-500">
							Menu
						</span>

						<button
							className="text-2xl"
							onClick={() => setOpen(false)}
							aria-label="Close menu"
						>
              				✕
            			</button>
					</div>

					<div className="flex-1 flex flex-col items-center justify-center gap-8">

						<Link className="py-2 px-5 rounded bg-gray-700" to="/lobby" onClick={() => setOpen(false)}>
							PLAY
						</Link>

						<Link className="py-2 px-5 rounded bg-gray-700" to="/gallery" onClick={() => setOpen(false)}>
							CUSTOMIZE
						</Link>

						<Link className="py-2 px-5 rounded bg-gray-700" to="/profile" onClick={() => setOpen(false)}>
							PROFILE
						</Link>

						<Login />

					</div>
				</div>
			)}
		</nav>
	);
}

export default Navbar;