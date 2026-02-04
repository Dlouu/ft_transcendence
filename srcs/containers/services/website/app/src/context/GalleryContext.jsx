import { createContext, useEffect } from "react";
import { getGallery } from "../services/galleryService";

export const GalleryContext = createContext();

export function GalleryProvider({ children }) {
	const [images, setImages] = useState([]);

	useEffect(() => {
		setImages(getGallery());
	}, []);

	const deleteImage = (id) => {
		setImages((prev) => prev.filter((img) => img.id !== id));
	};

	return (
		<GalleryContext.Provider
			value={{ images, deleteImage }}
		>
			{children}
		</GalleryContext.Provider>
	);
}
