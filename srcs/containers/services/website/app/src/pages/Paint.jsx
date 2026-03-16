import { useRef, useState } from "react";
import { Page, Card } from "../ui";
import PaintCanvas from "../components/paint/PaintCanvas";
import PaintToolbar from "../components/paint/PaintToolbar";

function Paint() {
	const canvasRef = useRef(null);

	const [tool, setTool] = useState("pen");
	const [color, setColor] = useState("#000000");
	const [brushSize, setBrushSize] = useState(1);
	const [undoRedo, setUndoRedo] = useState({ undo: null, redo: null });

	return (
		<Page center>
			<Card paint>
				<div className="flex sm:flex-row flex-col items-center justify-between">
				<PaintCanvas
					canvasRef={canvasRef}
					color={color}
					setColor={setColor}
					tool={tool}
					setTool={setTool}
					brushSize={brushSize}
					onUndoRedoReady={setUndoRedo}
				/>

				<PaintToolbar
					tool={tool}
					setTool={setTool}
					color={color}
					setColor={setColor}
					brushSize={brushSize}
					setBrushSize={setBrushSize}
					undo={undoRedo.undo}
					redo={undoRedo.redo}
					canvasRef={canvasRef}
				/>
				</div>
			</Card>
				<p className="m-2 text-xs text-gray-400 text-center">
					Users are solely responsible for the drawings and content they create.
				</p>
		</Page>
	);
}

export default Paint;
