import ToolSelector from './ToolSelector';
import BrushSelector from './BrushSelector';
import ColorPalette from './ColorPalette';
import Save from './Save';
import UndoRedo from './UndoRedo';

function PaintToolbar({
	tool,
	setTool,
	color,
	setColor,
	brushSize,
	setBrushSize,
	undo,
	redo,
	canvasRef,
	editedImageId,
}) {

	return (
		<>
			<div className="grid sm:flex sm:flex-col gap-2 justify-center sm:px-1 ">
				<div className="flex flex-row sm:flex-col justify-center gap-1">
					<ToolSelector tool={tool} setTool={setTool} canvasRef={canvasRef} />
					<UndoRedo onUndo={undo} onRedo={redo} />
					<div className="sm:flex sm:flex-col hidden gap-1">
						<BrushSelector brushSize={brushSize} setBrushSize={setBrushSize} />
						<Save canvasRef={canvasRef} editedImageId={editedImageId} />
					</div>
				</div>

				<div className="flex flex-row sm:hidden justify-center gap-1">
					<BrushSelector brushSize={brushSize} setBrushSize={setBrushSize} />
					<Save canvasRef={canvasRef} editedImageId={editedImageId} />
				</div>
			</div>

			<div className="grid sm:w-12.5">
				<div className="flex flex-row sm:flex-col justify-center gap-1">
					<ColorPalette color={color} setColor={setColor} tool={tool} setTool={setTool} />
				</div>
			</div>
		</>
	);
}

export default PaintToolbar;
