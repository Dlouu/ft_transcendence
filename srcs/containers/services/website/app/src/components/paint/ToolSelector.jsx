import { Button, Tooltip } from "../../ui";

function ToolSelector({ tool, setTool }) {

	return (
		<div className="flex gap-1">
			<Tooltip message = "pen">
				<Button
					variant="icon"
					isActive={tool === "brush"}
					onClick={() => setTool("brush")}
					title="Pen"
				>
					󰙏
				</Button>
			</Tooltip>

			<Tooltip message = "eraser">
				<Button
					variant="icon"
					isActive={tool === "eraser"}
					onClick={() => setTool("eraser")}
					title="Eraser"
				>
					󰇾
				</Button>
			</Tooltip>

			<Tooltip message = "bucket">
				<Button
					variant="icon"
					isActive={tool === "bucket"}
					onClick={() => setTool("bucket")}
					title="Bucket"
				>
					󰉦
				</Button>
			</Tooltip>

			<Tooltip message = "stroke">
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
