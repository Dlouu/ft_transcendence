import { useState } from "react";
import { Button, Page } from "../ui";
import { useNavigate } from "react-router-dom";
import PaintCanvas from "../components/paint/PaintCanvas";
import PaintToolbar from "../components/paint/PaintToolbar";

function Paint() {
	const navigate = useNavigate();

	const [tool, setTool] = useState("brush");
	const [color, setColor] = useState("#000000");
	const [brushSize, setBrushSize] = useState(1);

	return (
		<Page center>

			<PaintCanvas
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
				<Button variant="secondary">
					SAVE
				</Button>

				<Button variant="secondary" onClick={() => navigate("/gallery")}>
					BACK
				</Button>
			</div>

			<p className="m-4 text-xs text-gray-500 text-center">
				Users are solely responsible for the drawings and content they create.
			</p>

		</Page>
	);
}

export default Paint;
