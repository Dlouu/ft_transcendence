import Navbar from "./Navbar";

function AppLayout({ children }) {
	return (
		<div className="bg-gray-900 text-white">

			<Navbar />

			<main className="pt-14 min-h-[calc(100vh-3.5rem)]">
				{children}
			</main>

		</div>
	);
}

export default AppLayout;