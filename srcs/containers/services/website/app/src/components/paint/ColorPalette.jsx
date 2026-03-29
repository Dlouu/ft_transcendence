import { useState, useEffect, useRef, useCallback } from "react";
import { Button, Tooltip } from '../../ui';
import { COLORS } from './constants';

function ColorPalette({ color, setColor, tool, setTool }) {

	const [palette, setPalette] = useState(COLORS);
	const colorInputRefs = useRef({});
	const baseColors = palette.slice(0, COLORS.length);

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

			if (key >= 1 && key <= 9) {
				index = key - 1; // Keys 1-3 → colors 0-2
			}

			if (index >= 0 && index < palette.length) {
				setColor(palette[index]);
			}
		}, [palette, setColor, setTool]
	);

	useEffect(() => {
		document.addEventListener("keydown", handleKey);

		return () => {
			document.removeEventListener("keydown", handleKey);
		};
	}, [handleKey]);

	return (
		<div className="flex sm:flex-col gap-2">

			<div className="flex sm:flex-col sm:gap-1 mt-2 sm:mt-0 gap-0 items-center">
	
			{/* Active color */}
				<input
					type="color"
					value={color}
					onChange={(e) => setColor(e.target.value)}
					className="sm:w-9 sm:h-9 w-5 h-9 border sm:rounded border-purple-300 hover:opacity-80 transition cursor-pointer"
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
								className="sm:w-9 sm:h-9 w-5 h-9  border sm:rounded border-gray-400 hover:opacity-80 transition"
								title="Click to select, double-click to edit"
							/>
						</Tooltip>
						<input
							ref={(el) => colorInputRefs.current[`base-${index}`] = el}
							type="color"
							value={c}
							className="hidden"
							title="Edit color"
							onChange={(e) => {
								const newColor = e.target.value
								updateColor(index, newColor);
								setColor(newColor);
							}}
						/>
					</div>
				))}
			</div>
		</div>
	);
}

export default ColorPalette;
