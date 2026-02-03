import { BRUSH_SIZES, BRUSH_ICONS } from './constants';

function BrushSelector({ brushSize, setBrushSize }) {
	return (
		<div className="flex gap-1">
			{BRUSH_SIZES.map((size, index) => (
				<button
					key={size}
					onClick={() => setBrushSize(size)}
					className={`sm:w-8 sm:h-8 w-6 h-6 font-icon rounded transition ${
						brushSize === size
							? "bg-white text-black"
							: "bg-gray-700 hover:bg-gray-600"
					}`}
				>
					{BRUSH_ICONS[index]}
				</button>
			))}
		</div>
	);
}

export default BrushSelector;