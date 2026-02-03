import { Button } from "../../ui";

function UndoRedo({ onUndo, onRedo }) {
	return (
		<>
			<button className="sm:w-8 sm:h-8 w-6 h-6 rounded font-icon transition bg-gray-500 hover:bg-gray-600" onClick={onUndo}>
				󰕍
			</button>

			<button className="sm:w-8 sm:h-8 w-6 h-6 rounded font-icon transition bg-gray-500 hover:bg-gray-600" onClick={onRedo}>
				󰑏
			</button>
		</>
	);
}

export default UndoRedo;
