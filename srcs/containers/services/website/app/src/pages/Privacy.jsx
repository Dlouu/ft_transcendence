import LegalPage from "../ui/LegalPage";
import { Button } from "../ui";
import { useNavigate } from "react-router-dom";

function Privacy() {
	const navigate = useNavigate();

	return (
		<LegalPage title="Privacy Policy">
			<p>Your privacy matters to us (we promise).</p>

			<h2 className="text-xl font-semibold mt-6">1. Data Collected</h2>
			<p>
				We only collect information necessary for the proper functioning of the website:
			</p>
			<ul className="list-disc list-inside mt-2">
				<li>username</li>
				<li>game statistics</li>
				<li>drawings created using the customization tool</li>
			</ul>

			<p>
				Users are encouraged not to include personal or sensitive data
				in their drawings.
				UwUNO is not responsible for any data voluntarily included by users.
			</p>

			<h2 className="text-xl font-semibold mt-6">2. Usage</h2>
			<p>
				This data is used to display your profile and improve
				the user experience.
			</p>
			<p>
				Drawings are stored on the website but may be deleted at any time
				by the user or by UwUNO.
			</p>

			<h2 className="text-xl font-semibold mt-6">3. Data Sharing</h2>
			<p>
				Data is stored securely and is never sold
				or shared with third parties.
			</p>

			<h2 className="text-xl font-semibold mt-6">4. Cookies</h2>
			<p>
				Technical cookies may be used to ensure
				the proper functioning of the website.
			</p>

			<h2 className="text-xl font-semibold mt-6">5. Your Rights</h2>
			<p>
				You may request the modification or deletion of your data.
			</p>
			
			<Button variant="secondary" onClick={() => navigate(-1)}>
				BACK
			</Button>

		</LegalPage>


	);
}

export default Privacy;
