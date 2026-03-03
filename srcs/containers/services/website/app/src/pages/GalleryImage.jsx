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
						<Button>
							EDIT
						</Button>

						<Button>
							DUPLICATE
						</Button>

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
