import { useNavigate } from "react-router-dom";
import { Button } from "../ui";
import LegalPage from "../ui/LegalPage";

function Terms() {
	const navigate = useNavigate();

	return (
		<LegalPage title="Terms of Service">
			<p>Welcome to <strong>UwUNO</strong></p>

			<h2 className="text-xl font-semibold mt-6">1. Purpose</h2>
			<p>
				This website allows users to play UwUNO online, draw,
				and view their profile and game statistics.
			</p>

			<h2 className="text-xl font-semibold mt-6">2. Usage</h2>
			<p>
				Access to the website is free but requires the creation of a user account.
				You agree to use the service in a reasonable, lawful,
				and respectful manner toward other players.
			</p>

			<h2 className="text-xl font-semibold mt-6">3. Availability</h2>
			<p>
				The service is provided “as is”.
				Interruptions may occur, sometimes at the worst possible moment.
			</p>
			<p>
				UwUNO reserves the right to remove any drawing or suspend an account
				in case of violation of these terms or legal obligations.
			</p>

			<h2 className="text-xl font-semibold mt-6">4. Liability</h2>
			<p>
				We are not responsible for lost games
				or frustration caused by an unexpected +4 card or "revendication!" card.
			</p>

			<p>
				Users are solely responsible for the drawings and content they create
				through the card customization feature.
			</p>

			<p>
				UwUNO does not perform prior moderation of such content
				and cannot be held responsible for its nature.
			</p>

			<p>
				It is strictly forbidden to create or store illegal content
				or content that infringes on the rights of third parties.
			</p>

			<h2 className="text-xl font-semibold mt-6">5. Changes</h2>
			<p>
				These terms may be updated at any time.
			</p>

			<Button variant="secondary" onClick={() => navigate(-1)}>
				BACK
			</Button>

		</LegalPage>
	);
}

export default Terms;