import { Button } from "../../ui";

function ToolSelector({ tool, setTool, canvasRef }) {

	function savePNG() {
	const canvas = canvasRef.current;
	const dataURL = canvas.toDataURL("gallery");

	const link = document.createElement("a");
	link.href = dataURL;
	link.download = "UwUNO-drawing.png";
	link.click();
	}
	return (
		<div className="flex gap-1">
			<Button variant="icon" isActive={tool === "brush"} onClick={() => setTool("brush")} title="Pen">󰙏</Button>
			<Button variant="icon" isActive={tool === "eraser"} onClick={() => setTool("eraser")} title="Eraser">󰇾</Button>
			<Button variant="icon" isActive={tool === "pipette"} onClick={() => setTool("pipette")} title="Pipette">󰈊</Button>
			<Button variant="icon" isActive={tool === "floodfill"} onClick={() => setTool("floodfill")} title="Flood Fill">󰉦</Button>
			<Button variant="icon" isActive={tool === "line"} onClick={() => setTool("line")} title="Line">󰕞</Button>
			<Button variant="icon" onClick={() => setTool("save")} title="Save">󰉉</Button>
			<Button variant="icon" onClick={savePNG} title="Download">󱑢</Button>
		</div>
	);
}

export default ToolSelector;
