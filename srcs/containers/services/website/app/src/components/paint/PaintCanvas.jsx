import { useEffect, useRef } from "react";
import { WIDTH, HEIGHT, MAX_HEIGHT_RATIO } from "./constants";
import { drawCheckerBoard, drawLine, floodFill } from "./drawingUtils";
import { useUndoRedo } from "./useUndoRedo";

function PaintCanvas({ canvasRef, tool, color, brushSize, onUndoRedoReady }) {
	const ctxRef = useRef(null);
	const isDrawingRef = useRef(false);
	const lastPosRef = useRef(null);
	const pointerIdRef = useRef(null);
	const bgCanvasRef = useRef(null);

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
			drawLine(ctxRef.current, lx, ly, x, y, brushSize, color, tool);
		} else {
			drawPixel(x, y);
		}

		lastPosRef.current = { x, y };
	}

	function handlePointerDown(e) {
		e.preventDefault();
		saveSnapshot();

		const rect = canvasRef.current.getBoundingClientRect();
		const x = Math.floor(((e.clientX - rect.left) / rect.width) * WIDTH);
		const y = Math.floor(((e.clientY - rect.top) / rect.height) * HEIGHT);

		if (tool === "bucket") {
			floodFill(ctxRef.current, x, y, color);
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
	}

	function handlePointerCancel(e) {
		handlePointerUp(e);
	}

	return (
		<div className="w-full aspect-88-136">
			<div className="grid grid-cols-1">

			{/* BACKGROUND */}
				<canvas
					ref={bgCanvasRef}
					className="left-0 top-0 h-136 w-88 grid-colum-1 grid-row-1 z-2"
					style={{
						width: WIDTH * scale,
						height: HEIGHT * scale,
						imageRendering: "pixelated",
					}}
				/>

			{/* FOREGROUND */}
				<canvas
					ref={canvasRef}
					className="left-0 top-0 h-136 w-88 grid-colum-1 grid-row-1 z-99"
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