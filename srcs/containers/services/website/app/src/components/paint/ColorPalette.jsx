import { COLORS } from './constants';

function ColorPalette({ color, setColor }) {
	return (
		<div className="flex flex-wrap gap-1">
			<input
				type="color"
				value={color}
				onChange={(e) => setColor(e.target.value)}
				className="w-12 h-8 border border-gray-400 hover:opacity-80 transition cursor-pointer"
				title="Couleur personnalisée"
			/>
			
			
			{COLORS.map((c) => (
				<button
					key={c}
					onClick={() => setColor(c)}
					style={{ backgroundColor: c }}
					className="sm:w-8 sm:h-8 w-6 h-6 border border-gray-400 hover:opacity-80 transition"
					title={c}
				/>
			))}


		</div>
	);
}

export default ColorPalette;
