import { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { deleteImage, getImageById } from "../services/galleryService";
import { Button, Page, Card } from "../ui";

function GalleryImage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user } = useContext(AuthContext);

	const image = getImageById(id);

	if (!image) {
		return (
			<p>
				Image not found
			</p>
		);
	}

	const canDelete = user?.name === image.author;

	return (
		<Page center>
			<Card>
				<div className="flex flex-col items-center gap-4">
					<img
						src={image.src}
						className="max-w-full max-h-[80vh] object-contain rounded-xl"
						alt={id}
					/>

					<p className="text-gray-400">
						Author: {image.author}
					</p>

					<div className="flex flex-row gap-4">
						{/* {canDelete && ( */}
							<Button
								onClick={() => {
									deleteImage(id);
									navigate("/gallery");
								}}
							>
								DELETE
							</Button>
						{/* )} */}

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
