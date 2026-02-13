import { useEffect, useRef } from "react";
import { WIDTH, HEIGHT, MAX_HEIGHT_RATIO } from "./constants";
import { drawCheckerBoard, drawLine, floodFill, selectColor } from "./drawingUtils";
import { useUndoRedo } from "./useUndoRedo";

function PaintCanvas({ canvasRef, tool, setTool, color, setColor, brushSize, onUndoRedoReady }) {
	const ctxRef = useRef(null);
	const isDrawingRef = useRef(false);
	const startPosRef = useRef(null);
	const lastPosRef = useRef(null);
	const pointerIdRef = useRef(null);
	const bgCanvasRef = useRef(null);
	const previewImageRef = useRef(null);

	const scale = Math.floor(
		Math.min(
			window.innerWidth / WIDTH,
			(window.innerHeight * MAX_HEIGHT_RATIO) / HEIGHT
		)
	);

	const { saveSnapshot, undo, redo } = useUndoRedo(ctxRef);

	useEffect(() => {
		const bgCanvas = bgCanvasRef.current;
		const bgCtx = bgCanvas.getContext("2d");

		bgCanvas.width = WIDTH;
		bgCanvas.height = HEIGHT;

		drawCheckerBoard(bgCtx, WIDTH, HEIGHT);
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		canvas.width = WIDTH;
		canvas.height = HEIGHT;

		const ctx = canvas.getContext("2d");
		ctx.imageSmoothingEnabled = false;
		ctxRef.current = ctx;
		
		if (onUndoRedoReady) {
			onUndoRedoReady({ undo, redo });
		}
	}, [onUndoRedoReady]);

	function drawPixel(x, y) {
		if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT)
			return;

		const ctx = ctxRef.current;

	if (tool === "eraser") {
		ctx.clearRect(x, y, brushSize, brushSize);
		return;
	}

		ctx.fillStyle = color;
		ctx.fillRect(x, y, brushSize, brushSize);
	}

	function getCoords(e) {
		const rect = canvasRef.current.getBoundingClientRect();

		const clientX = e.touches ? e.touches[0].clientX : e.clientX;
		const clientY = e.touches ? e.touches[0].clientY : e.clientY;

		return {
			x: Math.floor(((clientX - rect.left) / rect.width) * WIDTH),
			y: Math.floor(((clientY - rect.top) / rect.height) * HEIGHT)
		};
	}

	function drawAtEvent(e) {
		const { x, y } = getCoords(e);

		if (tool === "stroke") {
			if (!startPosRef.current)
				return;

			const ctx = ctxRef.current;
			const snapshot = previewImageRef.current;

			if (snapshot) {
				ctx.putImageData(snapshot, 0, 0);
			}
			const { x: sx, y: sy } = startPosRef.current;
			drawLine(ctx, sx, sy, x, y, brushSize, color, tool);
			return;
		}

		if (lastPosRef.current) {
			const { x: lx, y: ly } = lastPosRef.current;
			drawLine(ctxRef.current, lx, ly, x, y, brushSize, color, tool);
		} else {
			drawPixel(x, y);
		}

		lastPosRef.current = { x, y };
	}

	function handlePointerDown(e) {
		e.preventDefault();
		saveSnapshot();
		const { x, y } = getCoords(e);

		if (tool === "bucket") {
			floodFill(ctxRef.current, x, y, color);
			return;
		}

		if (tool === "pipette") {
			selectColor(ctxRef.current, x, y, setColor);
			setTool("pen");
			return;
		}

		if (tool === "stroke") {
			startPosRef.current = { x, y };
			previewImageRef.current = ctxRef.current.getImageData(0, 0, WIDTH, HEIGHT);
			isDrawingRef.current = true;
			pointerIdRef.current = e.pointerId;
			canvasRef.current.setPointerCapture(e.pointerId);
			drawAtEvent(e);
			return;
		}

		isDrawingRef.current = true;
		pointerIdRef.current = e.pointerId;
		canvasRef.current.setPointerCapture(e.pointerId);
		drawAtEvent(e);
	}

	function handlePointerMove(e) {
		if (!isDrawingRef.current)
			return;
		drawAtEvent(e);
	}

	function handlePointerUp(e) {
		if (pointerIdRef.current !== null) {
			canvasRef.current.releasePointerCapture(pointerIdRef.current);
		}
		isDrawingRef.current = false;
		lastPosRef.current = null;
		pointerIdRef.current = null;
		startPosRef.current = null;
		previewImageRef.current = null;
	}

	function handlePointerCancel(e) {
		handlePointerUp(e);
	}

	return (
		<div className="w-full aspect-88-136 flex justify-center">
			<div
				className="relative"
				style={{
					width: WIDTH * scale,
					height: HEIGHT * scale,
				}}
			>

			{/* BACKGROUND */}
				<canvas
					ref={bgCanvasRef}
					className="absolute left-0 top-0 z-2"
					style={{
						width: WIDTH * scale,
						height: HEIGHT * scale,
						imageRendering: "pixelated",
					}}
				/>

			{/* FOREGROUND */}
				<canvas
					ref={canvasRef}
					className="absolute left-0 top-0 z-99"
					onPointerDown={handlePointerDown}
					onPointerMove={handlePointerMove}
					onPointerUp={handlePointerUp}
					onPointerCancel={handlePointerCancel}
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