import { useRef, useState, useContext } from "react";
import { Button, Page, Card } from "../ui";
import { useNavigate } from "react-router-dom";
import PaintCanvas from "../components/paint/PaintCanvas";
import PaintToolbar from "../components/paint/PaintToolbar";

function Paint() {
	const navigate = useNavigate();
	const canvasRef = useRef(null);

	const [tool, setTool] = useState("brush");
	const [color, setColor] = useState("#000000");
	const [brushSize, setBrushSize] = useState(1);

	function savePNG() {
		const canvas = canvasRef.current;
		const dataURL = canvas.toDataURL("gallery");

		const link = document.createElement("a");
		link.href = dataURL;
		link.download = "UwUNO-drawing.png";
		link.click();
	}

	return (
		<Page center>
			<Card big>
				<PaintCanvas
					canvasRef={canvasRef}
					tool={tool}
					color={color}
					brushSize={brushSize}
				/>

				<PaintToolbar
					tool={tool}
					setTool={setTool}
					color={color}
					setColor={setColor}
					brushSize={brushSize}
					setBrushSize={setBrushSize}
				/>

				<div className="flex flex-col sm:flex-row gap-4">
					<Button variant="secondary" onClick={savePNG}>
						SAVE
					</Button>

					<Button variant="secondary" onClick={() => navigate("/gallery")}>
						BACK
					</Button>
				</div>
			</Card>
				<p className="m-4 text-xs text-gray-400 text-center">
					Users are solely responsible for the drawings and content they create.
				</p>
		</Page>
	);
}

export default Paint;
