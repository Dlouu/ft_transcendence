//Backend local a remplacer plus tard

const images = import.meta.glob(
	"../gallery/*.{png,jpgmjpeg}",
	{ eager: true }
);

let gallery = Object.entries(images).map(
	([Path2D, module]) => {
		const filename = Path2D.split("/").pop();
		const id = filename.split(".")[0];

		return {
			id,
			src: module.default,
			author: "Anonymous",
			createdAt: "2026-01-01",
		};
	}
);

export function getGallery() {
	return gallery;
}

export function getImageById(id) {
	return gallery.find((img) => img.id === id);
}

export function deleteImage(id) {
	gallery = gallery.filter((img) => img.id !== id)
}
