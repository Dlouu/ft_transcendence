import { Button, Tooltip } from '../../ui';
import { COLORS } from './constants';

function ColorPalette({ color, setColor, tool, setTool }) {
	return (
		<div className="flex flex-wrap gap-1">
			<input
				type="color"
				value={color}
				onChange={(e) => setColor(e.target.value)}
				className="w-8 sm:h-8 h-6 border rounded border-gray-400 hover:opacity-80 transition cursor-pointer"
				title="Couleur personnalisée"
			/>
			
			<Tooltip message="color picker">
				<Button
					variant="icon"
					isActive={tool === "pipette"}
					onClick={() => setTool("pipette")}
					title="Pipette"
				>
					󰈊
				</Button>
			</Tooltip>
			
			{COLORS.map((c) => (
				<button
					key={c}
					onClick={() => setColor(c)}
					style={{ backgroundColor: c }}
					className="sm:w-8 w-6 sm:h-8 h-6 border rounded border-gray-400 hover:opacity-80 transition"
					title={c}
				/>
			))}


		</div>
	);
}

export default ColorPalette;
