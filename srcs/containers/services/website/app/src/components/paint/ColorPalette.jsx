import { useState, useEffect, useRef, useCallback } from "react";
import { Button, Tooltip } from '../../ui';
import { COLORS } from './constants';
import { selectColor } from "./drawingUtils";
import ToolSelector from "./ToolSelector";

function ColorPalette({ color, setColor, tool, setTool }) {

	const [palette, setPalette] = useState(COLORS);
	const colorInputRefs = useRef({});

	const updateColor = (index, newColor) => {
		setPalette((prev) =>
		prev.map((c, i) => (i === index ? newColor : c))
		);
	};

	const handleKey = useCallback(
		(e) => {
			if (e.repeat) return;
			if (e.key === "b" || e.key === "=")
				setTool("pipette");

			if (!/^[1-9]$/.test(e.key)) return;

			const key = Number(e.key);
			let index = -1;

			
			if (key >= 1 && key <= 3) {
				index = key - 1; // Keys 1-3 → colors 0-2
			} else if (key >= 4 && key <= 9) {
				index = COLORS.length + (key - 4); // Keys 4-9 → custom colors 0-5
			}

			if (index >= 0 && index < palette.length) {
				setColor(palette[index]);
			}
		},
		[palette, setColor]
	);

	useEffect(() => {
		document.addEventListener("keydown", handleKey);

		return () => {
			document.removeEventListener("keydown", handleKey);
		};
	}, [handleKey]);

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
					className="w-9 h-9 border rounded border-gray-400 hover:opacity-80 transition cursor-pointer"
					title="Custom color"
				/>

			{/* Pipette */}
				<Tooltip message="color picker [B] [=]">
					<Button
						variant="icon"
						isActive={tool === "pipette"}
						onClick={() => setTool("pipette")}
						title="Color picker"
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
								className="w-9 h-9 border rounded border-gray-400 hover:opacity-80 transition"
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
				<Tooltip message="add color, switch with [1]~[9]">
					<Button
						variant={customColors.length > 5 ? "iconDisabled" : "icon"}
						onClick={() => setPalette([...palette, color])}
						className="w-9 h-9 border rounded text-xs"
						title="Add color"
						disabled={customColors.length > 5}
					>
						+
					</Button>
				</Tooltip>
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
										className="w-9 h-9 border rounded border-gray-400 hover:opacity-80 transition"
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
