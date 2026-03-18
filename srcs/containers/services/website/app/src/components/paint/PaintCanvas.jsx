import { useEffect, useRef, useState } from "react";
import { WIDTH, HEIGHT, MAX_HEIGHT_RATIO, MAX_WIDTH_RATIO } from "./constants";
import { drawCheckerBoard, drawLine, floodFill, selectColor } from "./drawingUtils";
import { useUndoRedo } from "../../hooks/useUndoRedo";

function PaintCanvas({ canvasRef, tool, setTool, color, setColor, brushSize, onUndoRedoReady }) {
	const ctxRef = useRef(null);
	const isDrawingRef = useRef(false);
	const containerRef = useRef(null);
	const startPosRef = useRef(null);
	const lastPosRef = useRef(null);
	const pointerIdRef = useRef(null);
	const bgCanvasRef = useRef(null);
	const previewCanvasRef = useRef(null);
	const previewCtxRef = useRef(null);
	const previewImageRef = useRef(null);

	const [scale, setScale] = useState(0.8);

	useEffect(() => {
	function updateScale() {
		const newScale = Math.floor(
			Math.min(
				(window.innerWidth * MAX_WIDTH_RATIO) / WIDTH,
				(window.innerHeight * MAX_HEIGHT_RATIO) / HEIGHT
			)
		);
		setScale(newScale);
	}

	updateScale();
	window.addEventListener("resize", updateScale);

	return () => window.removeEventListener("resize", updateScale);
}, []);

	const { saveSnapshot, undo, redo } = useUndoRedo(ctxRef);

	useEffect(() => {
		const bgCanvas = bgCanvasRef.current;

		bgCanvas.width = WIDTH;
		bgCanvas.height = HEIGHT;

		const bgCtx = bgCanvas.getContext("2d");
		drawCheckerBoard(bgCtx, WIDTH, HEIGHT);

	}, []);

	useEffect(() => {
		const previewCanvas = previewCanvasRef.current;

		previewCanvas.width = WIDTH;
		previewCanvas.height = HEIGHT;

		const previewCtx = previewCanvas.getContext("2d");
		previewCtx.imageSmoothingEnabled = false;
		previewCtxRef.current = previewCtx;

	}, []);

	useEffect((undo, redo) => {
		const canvas = canvasRef.current;
		canvas.width = WIDTH;
		canvas.height = HEIGHT;

		const ctx = canvas.getContext("2d");
		ctx.imageSmoothingEnabled = false;
		ctxRef.current = ctx;
		
		if (onUndoRedoReady) {
			onUndoRedoReady({ undo, redo });
		}
	}, [onUndoRedoReady, canvasRef]);

	function clearPreview() {
		const ctx = previewCtxRef.current;
		if (!ctx)
			return;
		ctx.clearRect(0, 0, WIDTH, HEIGHT);
	}

	function drawPreview(x, y) {
		const ctx = previewCtxRef.current;
		if (!ctx)
			return;

		ctx.clearRect(0, 0, WIDTH, HEIGHT);

		if (tool === "bucket" || tool === "pipette")
			return;

		ctx.save();
		ctx.imageSmoothingEnabled = true;
		ctx.fillStyle = tool === "eraser" ? "rgba(0,0,0,0.2)" : color;
		ctx.fillRect(x, y, brushSize, brushSize);
		ctx.restore();
	}

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
		clearPreview();
		saveSnapshot();
		const { x, y } = getCoords(e);

		if (e.button === 2) {
			if (tool !== "pipette") {
				setTool("pipette");
			}
			return;
		}

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
		const { x, y } = getCoords(e);
		if (!isDrawingRef.current) {
			drawPreview(x, y);
			return;
		}
		drawAtEvent(e);
	}

	function handlePointerUp() {
		if (pointerIdRef.current !== null) {
			canvasRef.current.releasePointerCapture(pointerIdRef.current);
		}
		isDrawingRef.current = false;
		lastPosRef.current = null;
		pointerIdRef.current = null;
		startPosRef.current = null;
		previewImageRef.current = null;
		clearPreview();
	}

	function handlePointerCancel() {
		handlePointerUp();
	}

	function handlePointerLeave() {
		if (!isDrawingRef.current) {
			clearPreview();
		}
	}

	return (
		<div className="w-full aspect-88-136 flex justify-center mb-2">
			<div
				ref={containerRef}
				className="relative shrink-0"
				style={{
					width: WIDTH * scale,
					height: HEIGHT * scale,
				}}
			>

			{/* BACKGROUND */}
				<canvas
					ref={bgCanvasRef}
					className="absolute left-0 top-0 z-2"
					onContextMenu={(e) => e.preventDefault()}
					style={{
						width: WIDTH * scale,
						height: HEIGHT * scale,
						imageRendering: "pixelated",
					}}
				/>

			{/* PREVIEW */}
				<canvas
					ref={previewCanvasRef}
					className="absolute left-0 top-0 z-99 pointer-events-none"
					onContextMenu={(e) => e.preventDefault()}
					style={{
						width: WIDTH * scale,
						height: HEIGHT * scale,
						imageRendering: "pixelated",
					}}
				/>

			{/* FOREGROUND */}
				<canvas
					ref={canvasRef}
					className="absolute left-0 top-0 z-3"
					onPointerDown={handlePointerDown}
					onPointerMove={handlePointerMove}
					onPointerUp={handlePointerUp}
					onPointerCancel={handlePointerCancel}
					onPointerLeave={handlePointerLeave}
					onContextMenu={(e) => e.preventDefault()}
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