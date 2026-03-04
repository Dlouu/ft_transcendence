import { Button, Tooltip } from "../../ui";

function UndoRedo({ onUndo, onRedo }) {
	return (
		<>
			<Tooltip message="undo CTRL+Z">
				<Button variant="icon2" onClick={onUndo}>󰕍</Button>
			</Tooltip>

			<Tooltip message="redo CTRL+Y">
				<Button variant="icon2" onClick={onRedo}>󰑏</Button>
			</Tooltip>
		</>
	);
}

export default UndoRedo;
