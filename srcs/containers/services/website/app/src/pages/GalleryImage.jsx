import { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { deleteImage, getImageById } from "../services/galleryService";
import { Button, Page, Card } from "../ui";
import { useUser } from "../hooks/useUser";

function GalleryImage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user } = useContext(AuthContext);

	const { uploadCardBack, loading } = useUser();

	const image = getImageById(id);

	if (!image) {
		return (
			<p>
				Image not found
			</p>
		);
	}

	const canDelete = user?.name === image.author;

	const handleDuplicate = async () => {
		try {
			const response = await fetch(image.src);
			const blob = await response.blob();
			const file = new File([blob], `card-back-${id}.png`, { type: blob.type });

			await uploadCardBack(file);
			navigate("/gallery");
		} catch (error) {
			console.error("Failed to duplicate", error);
		}
	}

	return (
		<Page center>
			<Card>
				<div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">

					<div className="flex justify-center items-center">
						<img
							src={image.src}
							className="w-full max-h-[90vh] object-contain"
							alt={id}
						/>


					</div>

					<div className="flex flex-col gap-1">
						<p className="text-gray-400">
							Author: {image.author}
						</p>
						{canDelete &&
							<Button>
								EDIT
							</Button>
						}

						<Button onClick={handleDuplicate} disabled={loading}>
							DUPLICATE
						</Button>

						{canDelete && (
							<Button
								onClick={() => {
									deleteImage(id);
									navigate("/gallery");
								}}
							>
								DELETE
							</Button>
						)}



						<Button>
							SELECT AS BACK
						</Button>

						<Button onClick={() => navigate(-1)}>
							BACK
						</Button>


					</div>
				</div>
			</Card>
		</Page>	
	);
}

export default GalleryImage;
