function PaintToolbar({
	tool,
	setTool,
	color,
	setColor,
	brushSize,
	setBrushSize,
}) {
	const sizes= [1, 2, 3, 4];
	const colors = [
		"#000000",
		"#ffffff",
		"#ff0000",
		"#00ff00",
		"#0000ff",
		"#ffff00",
	];

	return (
		<div className="flex flex-col gap-4 p-3 border border-gray-700 rounded">

			{/* Tools */}
			<div className="flex gap-2">
				<button
					onClick={() => setTool("brush")}
					className={tool === "brush" ? "bg-white text-black" : ""}
				>
					PEN
				</button>

				<button
					onClick={() => setTool("eraser")}
					className={tool === "eraser" ? "bg-white text-black" : ""}
				>
					ERASER
				</button>
			</div>

			{/* Brush size */}
			<div className="flex gap-2">
				{sizes.map((size) => (
					<button
						key={size}
						onClick={() => setBrushSize(size)}
						className={
							brushSize === size
								? "bg-white text-black"
								: ""	
						}
					>
						{size}x
					</button>
				))}
			</div>

			{/* Colors */}
			<div className="flex gap-2 flex-wrap">
				{colors.map((c) => (
					<button
						key={c}
						onClick={() => setColor(c)}
						style={{ backgroundColor: c }}
						className="w-6 h-6 border"
					/>
				))}

				<input
					type="color"
					value={color}
					onChange={(e) => setColor(e.target.value)}
				/>
			</div>

		</div>
	)
}


export default PaintToolbar;