import { Button, Page, Card } from "../ui";
import { useNavigate } from "react-router-dom";
import UserGallery from "../components/profile/UserGallery";

function GalleryAll() {
	const navigate = useNavigate();

	return (
		<Page center>
			<Card big>
				<h2 className="text-2xl font-pixelm font-bold mb-6 text-center text-shadow-lg">
					BROWSE ALL IMAGES
				</h2>

				<UserGallery browseAll title="ALL USERS GALLERY" />

				<div className="flex justify-center mt-6">
					<Button variant="secondary" onClick={() => navigate("/gallery")}>
						BACK TO GALLERY
					</Button>
				</div>
			</Card>
		</Page>
	);
}

export default GalleryAll;
