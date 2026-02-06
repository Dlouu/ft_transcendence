import { useRef, useState } from "react";
import { Page, Card } from "../ui";
import PaintCanvas from "../components/paint/PaintCanvas";
import PaintToolbar from "../components/paint/PaintToolbar";

function Paint() {
	const canvasRef = useRef(null);

	const [tool, setTool] = useState("brush");
	const [color, setColor] = useState("#000000");
	const [brushSize, setBrushSize] = useState(1);
	const [undoRedo, setUndoRedo] = useState({ undo: null, redo: null });

	return (
		<Page center>
			<Card big>
				<PaintCanvas
					canvasRef={canvasRef}
					tool={tool}
					color={color}
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
			</Card>
				<p className="m-4 text-xs text-gray-400 text-center">
					Users are solely responsible for the drawings and content they create.
				</p>
		</Page>
	);
}

export default Paint;
