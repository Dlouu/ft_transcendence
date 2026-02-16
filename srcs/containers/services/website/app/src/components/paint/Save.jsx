import { Button, Tooltip } from "../../ui";

function Save({ canvasRef }) {

	function savePNG() {
		const canvas = canvasRef.current;
		const dataURL = canvas.toDataURL("gallery");

		const link = document.createElement("a");
		link.href = dataURL;
		link.download = "UwUNO-drawing.png";
		link.click();
	}
	return (
		<>
			<Tooltip message="Save in gallery">
				<Button variant="icon" onClick={() => setTool("save")} title="Save">󰉉</Button>
			</Tooltip>

			<Tooltip message="Download">
				<Button variant="icon" onClick={savePNG} title="Download">
					󱑢
				</Button>
			</Tooltip>
		</>
	);
}

export default Save;