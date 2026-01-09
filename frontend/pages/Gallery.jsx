import { Button, Page, Card } from "../ui";
import { Link, useNavigate } from "react-router-dom";
import { getGallery } from "../services/galleryService";

function Gallery() {
	const navigate = useNavigate();
	const images = getGallery();

	return (
		<Page center>
			<Card>
				<h2 className="text-3xl font-bold mb-6 text-shadow-lg">
					Gallery
				</h2>

				<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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

				<div className="flex flex-col sm:flex-row gap-4">
					<Button variant="success" onClick={() => navigate("/paint")}>
						CREATE
					</Button>

					<Button variant="secondary" onClick={() => navigate("/")}>
						BACK
					</Button>
				</div>
			</Card>
		</Page>
	);
}

export default Gallery;