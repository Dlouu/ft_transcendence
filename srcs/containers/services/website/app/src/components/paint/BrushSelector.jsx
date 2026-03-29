import { useEffect } from "react";
import { BRUSH_SIZES, BRUSH_ICONS } from './constants';
import { Tooltip } from "../../ui";

function BrushSelector({ brushSize, setBrushSize }) {

	function handleKey(e) {
		if (brushSize < 4 && e.key === "+" && e.repeat === false)
			setBrushSize(brushSize += 1);
		else if (brushSize > 1 && e.key === "-" && e.repeat === false)
			setBrushSize(brushSize -= 1);
	}

	useEffect(() => {
		document.addEventListener("keydown", handleKey);
		return () => {document.removeEventListener("keydown", handleKey)}
	});

	return (
		<Tooltip message="Size, press + or -">
			<div className="flex gap-1 sm:flex-col justify-center">
				{BRUSH_SIZES.map((size, index) => (
					<button
						key={size}
						onClick={() => setBrushSize(size)}
						className={`w-9 h-9 font-icon rounded transition ${
							brushSize === size
								? "bg-white text-black"
								: "bg-gray-700 hover:bg-gray-600"
						}`}
					>
						{BRUSH_ICONS[index]}
					</button>
				))}
			</div>
		</Tooltip>
	);
}

export default BrushSelector;
