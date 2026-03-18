import img from "../../assets/default-back.png"

function PersonalGallery() {
	return (
		<>
			<h2 className="text-2xl font-pixel font-bold sm:mb-2 mt-12">
				GALLERY
			</h2>
			<img
				src={img}
				className="h-34 w-22 rounded"
			/>
		</>
	);
}

export default PersonalGallery;