import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Button from "./Button";

function Navbar() {
	//mettre le playerName quand on est co je sais pas, a revoir
	const [open, setOpen] = useState(false);
	const location = useLocation();
	const { user, logout } = useContext(AuthContext);

	useEffect(() => {
		setOpen(false);
	}, [location.pathname]);
	//ferme le menu quand on change de page

	const handleLogout = () => {
		logout();
		setOpen(false);
	};

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
				UwUNO
			</Link>

		{/* Burger */}
			{user && (
				<button
					className="sm:hidden ml-auto p-2 rounded"
					onClick={() => setOpen(!open)}
					aria-label="Menu"
				>
					☰
				</button>
			)}

		{/* Desktop */}
			{user && (
				<div className="hidden sm:flex ml-auto items-center gap-4 font-bold">

					<Link to="/" className={linkClass("/")}>
						PLAY
					</Link>

					<Link to="/gallery" className={linkClass("/gallery")}>
						CUSTOMIZE
					</Link>

					<Link to="/profile" className={linkClass("/profile")}>
						PROFILE
					</Link>

					{user ? (
						<Button variant="login" onClick={handleLogout}>
							LOG OUT
						</Button>
					) : null}

				</div>
			)}

		{/* Mobile menu */}
			{user && open && (
				<div className="sm:hidden fixed inset-0 z-50 bg-gray-800/90 flex flex-col">
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

						<Link className="py-2 px-5 rounded bg-gray-700" to="/" onClick={() => setOpen(false)}>
							PLAY
						</Link>

						<Link className="py-2 px-5 rounded bg-gray-700" to="/gallery" onClick={() => setOpen(false)}>
							CUSTOMIZE
						</Link>

						<Link className="py-2 px-5 rounded bg-gray-700" to="/profile" onClick={() => setOpen(false)}>
							PROFILE
						</Link>

						{user ? (
							<Button variant="login" onClick={handleLogout}>
								LOG OUT
							</Button>
						) : null}

					</div>
				</div>
			)}
		</nav>
	);
}

export default Navbar;