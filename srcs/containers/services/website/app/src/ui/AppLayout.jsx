import Navbar from "./Navbar";
import Footer from "./Footer";

function AppLayout({ children }) {
	return (
		<div className="min-h-screen flex flex-col bg-gray-900 text-white">
			
			<div className="pt-14">
				<Navbar />
			</div>

			<main className="flex-1">
				{children}
			</main>

			<Footer />

		</div>
	);
}

export default AppLayout;