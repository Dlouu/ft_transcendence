import { Link } from "react-router-dom";

function Footer() {
	return (
		<footer className="sticky text-center text-sm text-gray-400 py-4">
			<Link to="/terms" className="hover:underline mr-4">
				Terms of Service
			</Link>
			
			<Link to="/privacy" className="hover:underline">
				Privacy Policy
			</Link>
		</footer>
	);
}

export default Footer;