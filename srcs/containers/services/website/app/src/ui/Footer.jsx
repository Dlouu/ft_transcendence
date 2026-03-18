import { Link } from "react-router-dom";
import Button from "./Button";
import Rules from "../components/game/Rules";
import { useState } from "react";

function Footer() {
	const [showRules, setShowRules] = useState(false);

	return (
		<footer className="sticky text-center text-sm text-gray-400 py-4">
			<Link to="/terms" className="hover:underline mr-4">
				Terms of Service
			</Link>
			
			<Link to="/privacy" className="hover:underline mr-4">
				Privacy Policy
			</Link>

			<Link onClick={() => setShowRules(true) } className="hover:underline">
				Rules
			</Link>

			{showRules && (
				<Rules onClose={() => setShowRules(false)} />
			)}
		</footer>
	);
}

export default Footer;
