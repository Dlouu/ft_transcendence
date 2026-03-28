export interface TableViewport {
	canvasWidth: number;
	canvasHeight: number;
	tableWidth: number;
	tableHeight: number;
	offsetX: number;
	offsetY: number;
	centerX: number;
	centerY: number;
	scale: number;
}

export const TABLE_ASPECT_RATIO = 16 / 9;

export function createTableViewport(
	canvasWidth: number,
	canvasHeight: number,
	targetAspectRatio: number = TABLE_ASPECT_RATIO,
): TableViewport {
	const safeCanvasWidth = Math.max(1, Math.floor(canvasWidth));
	const safeCanvasHeight = Math.max(1, Math.floor(canvasHeight));

	const canvasAspectRatio = safeCanvasWidth / safeCanvasHeight;

	let tableWidth = safeCanvasWidth;
	let tableHeight = safeCanvasHeight;

	if (canvasAspectRatio > targetAspectRatio) {
		tableWidth = Math.floor(safeCanvasHeight * targetAspectRatio);
	} else if (canvasAspectRatio < targetAspectRatio) {
		tableHeight = Math.floor(safeCanvasWidth / targetAspectRatio);
	}

	tableWidth = Math.max(1, tableWidth);
	tableHeight = Math.max(1, tableHeight);

	const offsetX = (safeCanvasWidth - tableWidth) / 2;
	const offsetY = (safeCanvasHeight - tableHeight) / 2;

	return {
		canvasWidth: safeCanvasWidth,
		canvasHeight: safeCanvasHeight,
		tableWidth,
		tableHeight,
		offsetX,
		offsetY,
		centerX: offsetX + tableWidth / 2,
		centerY: offsetY + tableHeight / 2,
		scale: tableHeight / 1080,
	};
}