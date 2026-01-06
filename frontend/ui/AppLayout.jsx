import Navbar from "./Navbar";

function AppLayout({ children }) {
	return (
		<div className="min-h-screen bg-gray-200 text-white">

			<Navbar />

			<main>
				{children}
			</main>

		</div>
	);
}

export default AppLayout;