import { Button, Page, Card } from "../ui";
import { useNavigate } from "react-router-dom";

function Gallery() {
	const navigate = useNavigate();

	return (
		<Page>
			<Card>
				<h2 className="text-3xl font-bold mb-6 text-shadow-lg">
					Gallery
				</h2>

				<div className="flex flex-col sm:flex-row gap-4">
					<Button variant="success" onClick={() => navigate("/paint")}>
						CREATE
					</Button>

					<Button variant="secondary" onClick={() => navigate("/lobby")}>
						GO TO LOBBY
					</Button>
				</div>
			</Card>
		</Page>
	);
}

export default Gallery;