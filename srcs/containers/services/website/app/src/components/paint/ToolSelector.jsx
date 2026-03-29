import { useEffect } from "react";
import { Button, Tooltip } from "../../ui";

function ToolSelector({ tool, setTool }) {

	function handleKey(e) {
		if ((e.key === "z" || e.key === ".") && e.repeat === false)
			setTool("pen");
		else if ((e.key === "x" || e.key === "0")  && e.repeat === false)
			setTool("eraser");
		else if ((e.key === "c" || e.key === "*")  && e.repeat === false)
			setTool("bucket");
		else if ((e.key === "v")  && e.repeat === false)
			setTool("stroke");
	}

	useEffect(() => {
		document.addEventListener("keydown", handleKey);
		return () => {document.removeEventListener("keydown", handleKey)}
	});

	return (
		<div className="flex sm:flex-col gap-1">
			<Tooltip message = "pen [Z] [.]">
				<Button
					variant="icon"
					isActive={tool === "pen"}
					onClick={() => setTool("pen")}
					title="Pen"
				>
					󰙏
				</Button>
			</Tooltip>

			<Tooltip message = "eraser [X] [0]">
				<Button
					variant="icon"
					isActive={tool === "eraser"}
					onClick={() => setTool("eraser")}
					title="Eraser"
				>
					󰇾
				</Button>
			</Tooltip>

			<Tooltip message = "bucket [C] [*]">
				<Button
					variant="icon"
					isActive={tool === "bucket"}
					onClick={() => setTool("bucket")}
					title="Bucket"
				>
					󰉦
				</Button>
			</Tooltip>

			<Tooltip message = "stroke [V]">
				<Button
					variant="icon"
					isActive={tool === "stroke"}
					onClick={() => setTool("stroke")}
					title="Stroke"
				>
					󰕞
				</Button>
			</Tooltip>
		</div>
	);
}

export default ToolSelector;
