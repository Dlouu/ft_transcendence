import { useEffect } from "react";
import { Button, Tooltip } from "../../ui";
import { prepareCardBack } from "./drawingUtils";
import { WIDTH, HEIGHT } from "./constants";
import { useNotifications } from "../../context/AlertContext";

function Save({ canvasRef }) {
	const { notify } = useNotifications();

	async function saveInGallery() {
		try {
			const canvas = canvasRef.current;
			if (!canvas) {
				notify("Canvas not found", "error");
				return;
			}

			canvas.toBlob(async (file) => {
				if (!file) {
					notify("Failed to generate image", "error");
					return;
				}

				const uploadFile = new File([file], "UwUNO-drawing.png", {
					type: "image/png",
				});
				const formData = new FormData();
				formData.append("image", uploadFile);

				const response = await fetch("/api/user/upload_card_image", {
					method: "POST",
					body: formData,
					credentials: "include",
				});

				if (!response.ok) {
					throw new Error(`API error: ${response.status}`);
				}

				notify("Image saved to gallery successfully", "success");
			}, "image/png");
		} catch (error) {
			console.error("Error saving to gallery:", error);
			notify("Failed to save image", "error");
		}
	}

	function savePNG() {
		const canvas = canvasRef.current;
		const dataURL = canvas.toDataURL("gallery");

		const link = document.createElement("a");
		link.href = dataURL;
		link.download = "UwUNO-drawing.png";
		link.click();
	}

	function handleKey(e) {
		if (e.key === "s" && e.ctrlKey && e.repeat === false)
			savePNG();
	}
	
	useEffect(() => {
		document.addEventListener("keydown", handleKey);

		return () => {document.removeEventListener("keydown", handleKey)}
	}, []);

	function saveCardBack() {
		const canvas = canvasRef.current;
		if (!canvas)
			return;

		const ctx = canvas.getContext("2d");
		if (!ctx)
			return;

		const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
		const processed = prepareCardBack(imageData, [43, 42, 51]);
	
		const exportCanvas = document.createElement("canvas");
		exportCanvas.width = WIDTH;
		exportCanvas.height = HEIGHT;
		const exportCtx = exportCanvas.getContext("2d");
	
		if (!exportCtx)
			return;

		exportCtx.putImageData(processed, 0, 0);

		const dataURL = exportCanvas.toDataURL("image/png");
		const link = document.createElement("a");

		link.href = dataURL;
		link.download = "UwU-CardBack.png";
		link.click();
	}

	return (
		<>
			<Tooltip message="Save in gallery CTRL+S">
				<Button variant="icon" onClick={saveInGallery} title="Save">󰉉</Button>
			</Tooltip>

			<Tooltip message="Download">
				<Button variant="icon" onClick={savePNG} title="Download">
					󱑢
				</Button>
			</Tooltip>

			{/* <Tooltip message="Set as card's back">
				<Button variant="icon" onClick={saveCardBack} title="Set as card's back">
					󱑢
				</Button>
			</Tooltip> */}
		</>
	);
}

export default Save;