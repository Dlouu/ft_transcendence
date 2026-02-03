import ToolSelector from './ToolSelector';
import BrushSelector from './BrushSelector';
import ColorPalette from './ColorPalette';
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
	canvasRef
}) {
	return (
		<>
			<div className="flex flex-row justify-center gap-1 py-1">
				<UndoRedo onUndo={undo} onRedo={redo} />
				<BrushSelector brushSize={brushSize} setBrushSize={setBrushSize} />
			</div>
			<div className="flex flex-row justify-center gap-1 py-1">
				<ToolSelector tool={tool} setTool={setTool} canvasRef={canvasRef} />
			</div>
			<div className="flex flex-row justify-center gap-1 py-1">
				<ColorPalette color={color} setColor={setColor} />
			</div>
		</>
	);
}

export default PaintToolbar;

//choisir les picto
//https://pictogrammers.com/library/mdi/

//ctrl Z/Y