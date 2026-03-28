import { useRef, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Page } from "../ui";
import PaintCanvas from "../components/paint/PaintCanvas";
import PaintToolbar from "../components/paint/PaintToolbar";

function Paint() {
	const canvasRef = useRef(null);
	const location = useLocation();
	const imageToEdit = location.state;
	const [tool, setTool] = useState("pen");
	const [color, setColor] = useState("#000000");
	const [brushSize, setBrushSize] = useState(1);
	const [undoRedo, setUndoRedo] = useState({ undo: null, redo: null });

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		if (!imageToEdit?.src) return;

		const img = new Image();
		img.crossOrigin = "anonymous";
		img.src = imageToEdit.src;

		img.onload = () => {
			const canvas = canvasRef.current;
			if (!canvas) return;

			const ctx = canvas.getContext("2d", { willReadFrequently: true });

			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
		};
	}, [imageToEdit]);

	return (
		<Page center>
			<div className="flex sm:flex-row flex-col items-center justify-between mt-2 p-2 bg-gray-700/70 rounded shadow-md">
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
					editedImageId={imageToEdit?.id}
				/>
			</div>
			<p className="m-2 text-xs text-gray-400 text-center">
				Users are solely responsible for the drawings and content they create.
			</p>
		</Page>
	);
}

export default Paint;
