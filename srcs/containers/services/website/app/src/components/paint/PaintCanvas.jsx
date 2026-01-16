import { useEffect, useRef } from "react";

const WIDTH = 88;
const HEIGHT = 136;

function drawCheckerBoard(ctx, width, height) {
	const light = "#9e91a4";
	const dark = "#7a6b81";

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			ctx.fillStyle = (x + y) % 2 === 0 ? light : dark;
			ctx.fillRect(x, y, 1, 1);
		}
	}
}

function PaintCanvas({ tool, color, brushSize }) {
	const CanvasRef = useRef(null);
	const scale = Math.floor(
		Math.min(
			window.innerWidth / WIDTH,
			window.innerHeight / HEIGHT
		)
	);

	useEffect(() => {
		const canvas = CanvasRef.current;
		canvas.width = WIDTH;
		canvas.height = HEIGHT;

		const ctx = canvas.getContext("2d");
		ctx.imageSmoothingEnabled = false;

		drawCheckerBoard(ctx, WIDTH, HEIGHT);
	}, []);

	const handleClick = (e) => {
		const canvas = CanvasRef.current;
		const rect = canvas.getBoundingClientRect();

		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;

		const x = Math.floor((e.clientX -rect.left) *scaleX);
		const y = Math.floor((e.clientY -rect.top) *scaleY);

		const ctx = canvas.getContext("2d");

		if (tool === "eraser") {
			ctx.clearRect(x, y, brushSize, brushSize);

			for (let yy = 0; yy < brushSize; yy++) {
				for (let xx = 0; xx < brushSize; xx++) {
					const px = x + xx;
					const py = y + yy;

					if (px < WIDTH && py < HEIGHT) {
						ctx.fillStyle = 
							(px + py) % 2 === 0 ? "#9e91a4" : "#7a6b81";
						ctx.fillRect(px , py, 1, 1);
					}
				}
			}
		} else {
			ctx.fillStyle = color;
			ctx.fillRect(x, y, brushSize, brushSize);
		}	
	};

	return (
		<div className="w-full max-w-md aspect-88-136 border border-gray-700">
			<div className="flex justify-center border border-gray-500">
				<canvas
					ref={CanvasRef}
					onClick={handleClick}
					style={{
						width: WIDTH * scale,
						height: HEIGHT * scale,
						imageRendering: "pixelated",
					}}
				/>
			</div>
		</div>
	);
}

export default PaintCanvas;