const images = import.meta.glob(
	"../../gallery/*.{png,jpg,jpeg}",
	{ eager: true }
);

const gallery = Object.entries(images).map(([Path2D, module]) => {
	const filename = Path2D.split("/").pop();
	const id = filename.split(".")[0];

	return {
		id,
		src: module.default,
		type: "default",
	};
});

export function getDefaultGallery() {
	return gallery;
}

export function getDefaultImage(id) {
	return gallery.find((img) => img.id === id);
}
