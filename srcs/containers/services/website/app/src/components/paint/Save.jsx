import { useApi } from "../../hooks/useApi";
import { useEffect } from "react";
import { Button, Tooltip } from "../../ui";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotifications";

function Save({ canvasRef }) {
	const { post } = useApi();
	const { notify } = useNotifications();
	const navigate = useNavigate();

	async function saveInGallery() {
		try {
			const canvas = canvasRef.current;
			if (!canvas) {
				notify("Canvas not found", "error");
				return;
			}

			canvas.toBlob(async (blob) => {
				if (!blob) {
					notify("Failed to generate image", "error");
					return;
				}

				const uploadFile = new File([blob], "UwUNO-drawing.png", {
					type: "image/png",
				});
				const formData = new FormData();
				formData.append("image", uploadFile);

				await post("/api/user/upload_card_image", uploadFile, "Image saved to gallery successfully");
				navigate("/gallery");
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
	});

	return (
		<>
			<Tooltip message="Download">
				<Button variant="icon2" onClick={savePNG} title="Download">
					󱑢
				</Button>
			</Tooltip>

			<Tooltip message="Save in gallery CTRL+S">
				<Button variant="icon2" onClick={saveInGallery} title="Save">󰉉</Button>
			</Tooltip>


		</>
	);
}

export default Save;