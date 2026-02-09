import { Button, Tooltip } from "../../ui";

function UndoRedo({ onUndo, onRedo }) {
	return (
		<>
			<Tooltip message="undo">
				<Button variant="icon" onClick={onUndo}>󰕍</Button>
			</Tooltip>

			<Tooltip message="redo">
				<Button variant="icon" onClick={onRedo}>󰑏</Button>
			</Tooltip>
		</>
	);
}

export default UndoRedo;
