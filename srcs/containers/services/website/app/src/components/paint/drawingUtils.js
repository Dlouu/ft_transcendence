import { WIDTH, HEIGHT, RAW_MASK, CHECKER_LIGHT, CHECKER_DARK } from './constants';

const CARD_MASK = (() => {
	const lines = RAW_MASK.split("\n");
	const mask = new Uint8Array(WIDTH * HEIGHT);

	for (let y = 0; y < HEIGHT; y++) {
		for (let x = 0; x < WIDTH; x++) {
			mask[y * WIDTH + x] = lines[y][x] === "1" ? 1 : 0;
		}
	}
	return mask;
})();

export function prepareCardBack  (orignalImageData, fillColor) {
	if (orignalImageData.width !== WIDTH || orignalImageData.height !== HEIGHT) {
		throw new Error("Invalid image dimensions");
	}
	const cloned = new Uint8ClampedArray(orignalImageData.data);
	const newImageData = new ImageData(cloned, WIDTH, HEIGHT);
	const data = newImageData.data;

	const [r, g, b] = fillColor;

	for (let i = 0; i < WIDTH * HEIGHT; i++) {
		const index = i * 4;
		if (data[index + 3] === 0) {
			data[index] = r;
			data[index + 1] = g;
			data[index + 2] = b;
			data[index + 3] = 255;
		}

		if (CARD_MASK[i] === 0) {
			data[index] = 0;
			data[index + 1] = 0;
			data[index + 2] = 0;
			data[index + 3] = 0;
		}
	}
	return newImageData;
}

export function drawCheckerBoard(ctx, width, height) {
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			ctx.fillStyle = (x + y) % 2 === 0 ? CHECKER_LIGHT : CHECKER_DARK;
			ctx.fillRect(x, y, 1, 1);
		}
	}
}

export function drawPixel(ctx, x, y, brushSize, color, tool) {
	if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT)
		return;

	if (tool === "eraser") {
		ctx.clearRect(x, y, brushSize, brushSize);
		return;
}
	ctx.fillStyle = color;
	ctx.fillRect(x, y, brushSize, brushSize);
}

export function drawLine(ctx, x0, y0, x1, y1, brushSize, color, tool) {
	const dx = Math.abs(x1 - x0);
	const dy = Math.abs(y1 - y0);
	const sx = x0 < x1 ? 1 : -1;
	const sy = y0 < y1 ? 1 : -1;
	let err = dx - dy;

	while (true) {
		drawPixel(ctx, x0, y0, brushSize, color, tool);
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

function rgbToHex(r, g, b) {
	return '#' + [r, g, b]
		.map(x => {
			const hex = x.toString(16);
			return hex.length === 1 ? '0' + hex : hex;
		})
		.join('')
		.toUpperCase();
}

export function selectColor(ctx, x, y, setColor) {
	const imageData = ctx.getImageData(x, y, 1, 1);
	const data = imageData.data;
	
	const hex = rgbToHex(data[0], data[1], data[2]);
	setColor(hex);
}

function hexToRgba(hex) {
	const bigint = parseInt(hex.slice(1), 16);
	return [
		(bigint >> 16) & 255,
		(bigint >> 8) & 255,
		bigint & 255,
		255,
	];
}

export function floodFill(ctx, x, y, fillColor) {
	const canvas = ctx.canvas;
	const { width, height } = canvas;

	const imageData = ctx.getImageData(0, 0, width, height);
	const data = imageData.data;

	const stack = [[x, y]];

	const index = (x, y) => (y * width + x) * 4;

	const targetIndex = index(x, y);
	const targetColor = data.slice(targetIndex, targetIndex + 4);
	const newColor = hexToRgba(fillColor);

	if (
		targetColor[0] === newColor[0] &&
		targetColor[1] === newColor[1] &&
		targetColor[2] === newColor[2] &&
		targetColor[3] === newColor[3]
	) return;

	while (stack.length) {
		const [cx, cy] = stack.pop();
		const i = index(cx, cy);

		const currentColor = data.slice(i, i + 4);

		if (
			currentColor[0] === targetColor[0] &&
			currentColor[1] === targetColor[1] &&
			currentColor[2] === targetColor[2] &&
			currentColor[3] === targetColor[3]
		) {
			data[i] = newColor[0];
			data[i + 1] = newColor[1];
			data[i + 2] = newColor[2];
			data[i + 3] = 255;

			if (cx > 0) stack.push([cx - 1, cy]);
			if (cx < width - 1) stack.push([cx + 1, cy]);
			if (cy > 0) stack.push([cx, cy - 1]);
			if (cy < height - 1) stack.push([cx, cy + 1]);
		}
	}

	ctx.putImageData(imageData, 0, 0);
}
