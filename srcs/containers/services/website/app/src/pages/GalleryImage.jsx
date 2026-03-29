import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getDefaultImage } from "../services/gallery/galleryService";
import { Button, Page, Card } from "../ui";
import { useUser } from "../hooks/useUser";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function GalleryImage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { uploadCardBack, setCardBack, removeCard, loading } = useUser();
	const { user, refreshUser } = useContext(AuthContext);
	const location = useLocation();
	const imageFromState = location.state;
	const image = imageFromState || getDefaultImage(id);
	const ownerId = image?.ownerId;

	const isOwnerImage = ownerId != null
		? Number(ownerId) === Number(user?.user_id)
		: image?.type === "user";

	if (!image) {
		return (
			<p>Image not found</p>
		);
	}

	const handleDelete = async () => {
		if (!isOwnerImage) {
			return;
		}
		try {
			await removeCard(id);
			navigate("/gallery");
		} catch (error) {
			// console.error("Failed to delete: ", error);
		}
	}

	const handleSetBack = async () => {
		if (!isOwnerImage) {
			return;
		}
		try {
			await setCardBack(id);
			navigate("/gallery");
			await refreshUser();
		} catch (error) {
			// console.error("Failed to set as back card: ", error);
		}
	}

	const handleSetBackFromDefault = async () => {
		if (isOwnerImage) {
			return;
		}

		try {
			const response = await fetch(image.src);
			const blob = await response.blob();
			const file = new File([blob], `card-back-${id}.png`, { type: blob.type });

			const uploadResponse = await uploadCardBack(file);
			const newCardId = uploadResponse?.image_id ?? uploadResponse?.data?.image_id;

			if (!newCardId) {
				throw new Error("Missing image_id in upload response");
			}

			await setCardBack(newCardId);
			await refreshUser();
			navigate("/gallery");

		} catch (error) {
			// console.error("Failed to duplicate and set as back card:", error);
		}
	}

	const handleDuplicate = async () => {
		try {
			const response = await fetch(image.src);
			const blob = await response.blob();
			const file = new File([blob], `card-back-${id}.png`, { type: blob.type });

			await uploadCardBack(file);
			navigate("/gallery");

		} catch (error) {
			// console.error("Failed to duplicate", error);
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

						{ isOwnerImage && (
							<Button
								onClick={() => navigate("/paint", {
									state: {src: image.src, id: image.id, type: image.type, ownerId: image.ownerId}
								})}
							>
								EDIT
							</Button>
						)}

						<Button onClick={handleDuplicate} disabled={loading}>
							DUPLICATE
						</Button>

						{ isOwnerImage && (
							<Button onClick={handleSetBack} disabled={loading}>
								SELECT AS BACK
							</Button>
						)}

						{ !isOwnerImage && (
							<Button onClick={handleSetBackFromDefault} disabled={loading}>
								SELECT AS BACK
							</Button>
						)}

						{ isOwnerImage && (
							<Button onClick={handleDelete}>
								DELETE
							</Button>
						)}

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
