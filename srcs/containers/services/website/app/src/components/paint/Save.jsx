import { useEffect } from "react";
import { Button, Tooltip } from "../../ui";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotifications";

function Save({ canvasRef, editedImageId }) {
	const { notify } = useNotifications();
	const navigate = useNavigate();

	async function saveInGallery() {
		try {
			const canvas = canvasRef.current;
			if (!canvas) {
				notify("Canvas not found", "error");
				return;
			}

			const blob = await new Promise((resolve, reject) => {
				canvas.toBlob((blobResult) => {
					if (!blobResult) {
						reject(new Error("Failed to generate image"));
						return;
					}
					resolve(blobResult);
				}, "image/png");
			});

			const uploadFile = new File([blob], "UwUNO-drawing.png", {
				type: "image/png",
			});
			const formData = new FormData();
			formData.append("image", uploadFile);

			const parsedEditedImageId = Number(editedImageId);
			const hasEditedImageId = Number.isFinite(parsedEditedImageId);
			if (hasEditedImageId) {
				formData.append("image_id", String(parsedEditedImageId));
			}

			const response = await fetch("/api/user/upload_card_image", {
				method: "POST",
				credentials: "include",
				body: formData,
			});

			const contentType = response.headers.get("content-type") || "";
			const data = contentType.includes("application/json")
				? await response.json()
				: await response.text();

			if (!response.ok) {
				const message = typeof data === "string"
					? data
					: data?.message || "Failed to save image";
				throw new Error(message);
			}

			notify(
				hasEditedImageId
					? "Image updated successfully"
					: "Image saved to gallery successfully",
				"success"
			);
			navigate("/gallery");

		} catch (error) {
			// console.error("Error saving to gallery:", error);
			notify(error.message || "Failed to save image", "error");
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
