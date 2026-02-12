import { useState, useRef } from "react";
import { Button, Tooltip } from '../../ui';
import { COLORS } from './constants';
import ToolSelector from "./ToolSelector";

function ColorPalette({ color, setColor, tool, setTool }) {
	const [palette, setPalette] = useState(COLORS);
	const colorInputRefs = useRef({});

	const updateColor = (index, newColor) => {
		setPalette((prev) =>
		prev.map((c, i) => (i === index ? newColor : c))
		);
	};

	const baseColors = palette.slice(0, COLORS.length);
	const customColors = palette.slice(COLORS.length);

	return (
		<div className="flex flex-col gap-2">

			<div className="flex gap-1 items-center">
	
			{/* Active color */}
				<input
					type="color"
					value={color}
					onChange={(e) => setColor(e.target.value)}
					className="sm:w-8 w-6 sm:h-8 h-6 border rounded border-gray-400 hover:opacity-80 transition cursor-pointer"
					title="Couleur personnalisée"
				/>

			{/* Pipette */}
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

			{/* Base colors */}
				{baseColors.map((c, index) => (
					<div key={`base-${index}`} className="relative group">
						<Tooltip message="double click to edit">
							<button
								onClick={() => setColor(c)}
								onDoubleClick={() => colorInputRefs.current[`base-${index}`]?.click()}
								style={{ backgroundColor: c }}
								className="sm:w-8 w-6 sm:h-8 h-6 border rounded border-gray-400 hover:opacity-80 transition"
								title="Click to select, double-click to edit"
							/>
						</Tooltip>
						<input
							ref={(el) => colorInputRefs.current[`base-${index}`] = el}
							type="color"
							value={c}
							onChange={(e) => {
								const newColor = e.target.value
								updateColor(index, newColor);
								setColor(newColor);
							}}
							className="hidden"
							title="Edit color"
						/>
					</div>
				))}

			{/* Add button */}
				{customColors.length < 6 &&
					<Button
						variant="icon"
						onClick={() => setPalette([...palette, color])}
						className="w-6 h-6 border rounded text-xs"
						title="Ajouter une couleur"
					>
						+
					</Button>
				}

			</div>

		{/* Custom added colors */}
			{customColors.length > 0 && (
				<div className="flex gap-1">
					{customColors.map((c, index) => {
						const globalIndex = baseColors.length + index;
						return (
							<div key={`custom-${index}`} className="relative group">
								<Tooltip message="double click to edit">
									<button
										onClick={() => setColor(c)}
										onDoubleClick={() => colorInputRefs.current[`custom-${index}`]?.click()}
										onChange={(e) => updateColor(index, e.target.value)}
										style={{ backgroundColor: c }}
										className="sm:w-8 w-6 sm:h-8 h-6 border rounded border-gray-400 hover:opacity-80 transition"
										title="Click to select, double-click to edit"
									/>
								</Tooltip>
								<input
									ref={(el) => colorInputRefs.current[`custom-${index}`] = el}
									type="color"
									value={c}
									onChange={(e) => {
										const newColor = e.target.value
										updateColor(globalIndex, newColor);
										setColor(newColor);
									}}
									className="hidden"
									title="Edit color"
								/>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

export default ColorPalette;
