import { useContext, useRef, useState} from "react";
import { Button, Page, Card } from "../ui";
import { useUser } from "../hooks/useUser";
import { Link, useNavigate } from "react-router-dom";
import { getDefaultGallery } from "../services/gallery/galleryService";
import { AuthContext } from "../context/AuthContext";
import UserGallery from "../components/profile/UserGallery";

function Gallery() {
	const { user } = useContext(AuthContext);
	const userId = user?.user_id;
	const navigate = useNavigate();
	const images = getDefaultGallery();
	const fileInputRef = useRef(null);
	const { uploadCardBack } = useUser();
	const [refreshKey, setRefreshKey] = useState(0);

	const refreshGallery = () => {
		setRefreshKey((prev) => prev + 1);
	};

	const handleImport = () => {
		fileInputRef.current.click();
	};

	const handleAllImages = () => {
		navigate("/gallery/all");
	};


	const handleFileChange = async (event) => {
		const file = event.target.files?.[0];
		if (!file) return;

		try {
			await uploadCardBack(file);
			refreshGallery();
		} catch (err) {
			console.error("Import failed", err);
		}
	};

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

				<UserGallery userId={userId} key={refreshKey} />

				<div className="flex flex-col sm:flex-row sm:gap-4 justify-center">
					<Button variant="success" onClick={() => navigate("/paint")}>
						CREATE
					</Button>

					<Button variant="success" onClick={handleImport}>
						IMPORT
					</Button>

					<Button variant="success" onClick={handleAllImages}>
						BROWSE ALL IMAGES
					</Button>

					<Button variant="secondary" onClick={() => navigate(-1)}>
						BACK
					</Button>
						<input
							type="file"
							accept="image/png,image/jpeg"
							ref={fileInputRef}
							onChange={handleFileChange}
							className="hidden"
						/>
				</div>
			</Card>
		</Page>
	);
}

export default Gallery;
