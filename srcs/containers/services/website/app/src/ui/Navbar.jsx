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

	const handleJWT = async (e) => {
		e.preventDefault();
		try {
			const request = await fetch("/tests/test_jwt", {
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				method: "POST",
				body: JSON.stringify({
					"jwt": "caca"
				}),
			})
			if (request.ok) {
				console.log(await request.json());
			}
		} catch (error) {
			console.log(error);

		}
	};

	const navLinks = [
		{ to: "/", label: "PLAY" },
		{ to: "/gallery", label: "CUSTOMIZE" },
		{ to: "/profile", label: "PROFILE" }
	];

	const linkClass = (path) =>
		`block px-3 py-2 rounded ${
			location.pathname === path
				? "bg-gray-600 text-purple-400"
				: "hover:bg-gray-700"
		}`;

	return (
		<nav
			className="
				fixed h-14 px-4 top-0 left-0 z-50 w-full
				bg-gray-800 border-b border-gray-700
				flex items-center
			"
		>

			<Link to="/" className="text-lg font-pixelm font-bold text-purple-500">
				UwUNO
			</Link>

		{/* A delete, pour tester si y'a le cookie actif */}
			<div className="px-2"></div>
			<Button variant="icon" onClick={handleJWT}>󱛞</Button>

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
				<div className="hidden sm:flex font-pixelhb ml-auto items-center gap-4 font-bold">
					{navLinks.map((link) => (
						<Link key={link.to} to={link.to} className={linkClass(link.to)}>
							{link.label}
						</Link>
					))}

					<Button variant="login" onClick={handleLogout}>
						LOG OUT
					</Button>
				</div>
			)}

		{/* Mobile menu */}
			{user && open && (
				<div className="flex flex-col sm:hidden font-pixelhb fixed inset-0 z-50 bg-gray-800/90">
					<div className="flex items-center justify-between p-4 border-b border-gray-700">
						<span className="text-lg font-pixelm text-purple-500">MENU</span>

						<button
							className="text-2xl"
							onClick={() => setOpen(false)}
							aria-label="Close menu"
						>
							✕
						</button>
					</div>

					<div className="flex-1 flex flex-col items-center justify-center gap-8">
						{navLinks.map((link) => (
							<Link
								key={link.to}
								className="py-2 px-5 rounded bg-gray-700"
								to={link.to}
								onClick={() => setOpen(false)}
							>
								{link.label}
							</Link>
						))}

						<Button variant="login" onClick={handleLogout}>
							LOG OUT
						</Button>
					</div>
				</div>
			)}
		</nav>
	);
}

export default Navbar;