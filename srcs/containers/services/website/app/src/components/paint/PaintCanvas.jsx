import { useEffect, useRef } from "react";

const WIDTH = 88;
const HEIGHT = 136;
const MAX_HEIGHT_RATIO = 0.7;

function restoreCheckerBoard(ctx, x, y, size) {
	const light = "#9e91a4";
	const dark = "#7a6b81";

	for (let dy = 0; dy < size; dy++) {
		for (let dx = 0; dx < size; dx++) {
			const px = x + dx;
			const py = y + dy;

			if (px < 0 || py < 0 || px >= WIDTH || py >= HEIGHT)
				continue;

			ctx.fillStyle =
				(px + py) % 2 === 0 ? light : dark;
			ctx.fillRect(px, py, 1, 1);
		}
	}
}

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
	const ctxRef = useRef(null);
	const canvasRef = useRef(null);
	const isDrawingRef = useRef(false);
	const lastPosRef = useRef(null);

	const scale = Math.floor(
		Math.min(
			window.innerWidth / WIDTH,
			(window.innerHeight * MAX_HEIGHT_RATIO) / HEIGHT
		)
	);

	useEffect(() => {
		const canvas = canvasRef.current;
		canvas.width = WIDTH;
		canvas.height = HEIGHT;

		const ctx = canvas.getContext("2d");
		ctx.imageSmoothingEnabled = false;
		ctxRef.current = ctx;
	
		drawCheckerBoard(ctx, WIDTH, HEIGHT);
	}, []);

	function drawPixel(x, y) {
		if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT)
			return;

		const ctx = ctxRef.current;

		if (tool === "eraser") {
			restoreCheckerBoard(ctx, x, y, brushSize);
			return;
		}

		ctx.fillStyle = color;
		ctx.fillRect(x, y, brushSize, brushSize);
	}

	function drawLine(x0, y0, x1, y1) {
		const dx = Math.abs(x1 - x0);
		const dy = Math.abs(y1 - y0);
		const sx = x0 < x1 ? 1 : -1;
		const sy = y0 < y1 ? 1 : -1;
		let err = dx - dy;

		while (true) {
			drawPixel(x0, y0);
			if (x0 === x1 && y0 === y1)
				break;

			const e2 = 2 * err;
			if (e2 > -dy) {
				err -= dy;
				x0 += sx;
			}
			if (e2 < dx) {
				err += dx;
				y0 += sy;
			}
		}
	}

	function drawAtEvent(e) {
		const rect = canvasRef.current.getBoundingClientRect();

		const clientX = e.touches ? e.touches[0].clientX : e.clientX;
		const clientY = e.touches ? e.touches[0].clientY : e.clientY;

		const x = Math.floor(
			((clientX - rect.left) / rect.width) * WIDTH
		);
		const y = Math.floor(
			((clientY - rect.top) / rect.height) * HEIGHT
		);

		if (lastPosRef.current) {
			const { x: lx, y: ly } = lastPosRef.current;
			drawLine(lx, ly, x, y);
		} else {
			drawPixel(x, y);
		}

		lastPosRef.current = { x, y };
	}

	return (
		<div className="w-full max-w-md aspect-88-136 border border-gray-700">
			<div className="flex justify-center border border-gray-500">
				<canvas
					ref={canvasRef}
					onMouseDown={(e) => {
						isDrawingRef.current = true;
						drawAtEvent(e);
					}}
					onMouseMove={(e) => {
						if (!isDrawingRef.current)
							return;
						drawAtEvent(e);
					}}
					onMouseUp={() => {
						isDrawingRef.current = false;
						lastPosRef.current = null;
					}}
					onMouseLeave={() => {
						isDrawingRef.current = false;
					}}
					onTouchStart={(e) => {
						e.preventDefault();
						isDrawingRef.current = true;
						drawAtEvent(e);
					}}
					onTouchMove={(e) => {
						e.preventDefault();
						if (!isDrawingRef.current)
							return;
						drawAtEvent(e);
					}}
					onTouchEnd={() => {
						isDrawingRef.current = false;
						lastPosRef.current = null;
					}}
					style={{
						width: WIDTH * scale,
						height: HEIGHT * scale,
						imageRendering: "pixelated",
						touchAction: "none"
					}}
				/>
			</div>
		</div>
	);
}

export default PaintCanvas;