import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { LobbyContext } from "../context/LobbyContext";
import Button from "./Button";
import Friendlist from "../pages/Friendlist";

function Navbar() {
	const [open, setOpen] = useState(false);
	const location = useLocation();
	const { user, logout } = useContext(AuthContext);
	const { pendingRequests } = useContext(LobbyContext);
	const [showFriends, setShowFriends] = useState(false);
	const hasPendingRequests = (pendingRequests?.length || 0) > 0;

	useEffect(() => {
		setOpen(false);
	}, [location.pathname]);

	const handleLogout = () => {
		logout();
		setOpen(false);
	};

	const navLinks = [
		{ to: "/", icon: "󰘸", label: "PLAY"},
		{ to: "/gallery", icon: "󰏘",label: "PAINT" },
		{ to: "/me", icon: "󰀄",label: "ME" }
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
				<div className="hidden sm:flex font-pixelhb ml-auto items-center gap-2 font-bold">
					{navLinks.map((link) => (
						<Link key={link.to} to={link.to} className={linkClass(link.to)}>
							<span className="font-icon text-purple-300">{link.icon}</span>
							<span className="px-2">{link.label}</span>
						</Link>
					))}

					<Link onClick={() =>  setShowFriends(true)} className="relative py-2 px-3 rounded hover:bg-gray-700">
						<span className="font-icon text-purple-300">󰀎</span>
						<span className="px-2">FRIENDS</span>
						{ hasPendingRequests && (
							<span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-yellow-500" />
						)}
					</Link>

					{showFriends && (
						<Friendlist onClose={() => setShowFriends(false)} />
					)}

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
						{ navLinks.map((link) => (
							<Link
								key={link.to}
								className="py-2 px-5 rounded bg-gray-700"
								to={link.to}
								onClick={() => setOpen(false)}
							>
								<span className="font-icon text-purple-300">{link.icon}</span>
								<span className="px-2">{link.label}</span>
							</Link>
						))}

						<Link onClick={() => { setShowFriends(true); setOpen(false); }} className="relative py-2 px-5 rounded bg-gray-700">
							<span className="font-icon text-purple-300">󰀎</span>
							<span className="px-2">FRIENDS</span>
							{hasPendingRequests && (
								<span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500" aria-label="Pending friend requests" />
							)}
						</Link>

						{ showFriends && (
							<Friendlist onClose={() => setShowFriends(false)} />
						)}

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
