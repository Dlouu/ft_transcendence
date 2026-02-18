import ToolSelector from './ToolSelector';
import BrushSelector from './BrushSelector';
import ColorPalette from './ColorPalette';
import Save from './Save';
import UndoRedo from './UndoRedo';
import { WIDTH } from './constants';

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
			<div className="grid sm:flex justify-center">
				<div className="flex flex-row justify-center gap-1 py-1">
					<ToolSelector tool={tool} setTool={setTool} canvasRef={canvasRef} />
					<UndoRedo onUndo={undo} onRedo={redo} />
				</div>

				<div className="flex flex-row justify-center gap-1 py-1">
					<BrushSelector brushSize={brushSize} setBrushSize={setBrushSize} />
					<Save canvasRef={canvasRef} />
				</div>
			</div>

			<div className="grid">
				<div className="flex flex-row justify-center gap-1 py-1">
					<ColorPalette color={color} setColor={setColor} tool={tool} setTool={setTool} />
				</div>
			</div>
		</>
	);
}

export default PaintToolbar;
