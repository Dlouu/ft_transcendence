import { Button, Page, Card } from "../ui";
import { Link, useNavigate } from "react-router-dom";
import { getGallery } from "../services/galleryService";

function Gallery() {
	const navigate = useNavigate();
	const images = getGallery();

	return (
		<Page center>
			<Card big>
				<h2 className="text-2xl font-pixelm font-bold mb-6 text-center text-shadow-lg">
					GALLERY
				</h2>

				<div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
					{images.map((img) => (
						<Link key={img.id} to={`/gallery/${img.id}`}>
							<img
								src={img.src}
								alt={img.id}
								className="rounded-lg hover:scale-105 transition"
							/>
						</Link>
					))}
				</div>

				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Button variant="success" onClick={() => navigate("/paint")}>
						CREATE
					</Button>

					<Button variant="success">
						IMPORT
					</Button>

					<Button variant="success">
						BROWSE ALL IMAGES
					</Button>

					<Button variant="secondary" onClick={() => navigate(-1)}>
						BACK
					</Button>
				</div>
			</Card>
		</Page>
	);
}

export default Gallery;
