import { Button, Page } from "../ui";
import { useNavigate } from "react-router-dom";

function Paint() {
	const navigate = useNavigate();

	return (
		<Page center>

			<div className="w-full max-w-2xl aspect-square border border-gray-700">
				{/* Le canvas de Paint ici*/}
			</div>

			<div className="flex flex-col sm:flex-row gap-4">
				<Button variant="secondary">
					SAVE
				</Button>

				<Button variant="secondary" onClick={() => navigate("/gallery")}>
					BACK
				</Button>
			</div>

			<p className="m-4">
				Users are solely responsible for the drawings and content they create.
			</p>

		</Page>
	);
}

export default Paint;
