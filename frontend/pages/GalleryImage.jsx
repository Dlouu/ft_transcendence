import { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { deleteImage, getImageById } from "../services/galleryService";
import { Button } from "../ui";

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
		<div className="flex flex-col items-center gap-4">
			<img
				src={image.src}
				className="max-w-full max-h-[80vh] object-contain"
				alt={id}
			/>

			<p className="text-gray-400">
				Author: {image.author}
			</p>

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
	);
}

export default GalleryImage;