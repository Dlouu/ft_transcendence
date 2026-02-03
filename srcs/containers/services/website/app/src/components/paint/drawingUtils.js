import { WIDTH, HEIGHT, CHECKER_LIGHT, CHECKER_DARK } from './constants';

export function restoreCheckerBoard(ctx, x, y, size) {
	for (let dy = 0; dy < size; dy++) {
		for (let dx = 0; dx < size; dx++) {
			const px = x + dx;
			const py = y + dy;

			if (px < 0 || py < 0 || px >= WIDTH || py >= HEIGHT)
				continue;

			ctx.fillStyle =
				(px + py) % 2 === 0 ? CHECKER_LIGHT : CHECKER_DARK;
			ctx.fillRect(px, py, 1, 1);
		}
	}
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
		restoreCheckerBoard(ctx, x, y, brushSize);
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
