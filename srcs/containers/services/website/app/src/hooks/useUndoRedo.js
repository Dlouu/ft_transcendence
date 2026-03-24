import { useRef, useEffect } from 'react';
import { WIDTH, HEIGHT, MAX_HISTORY } from '../components/paint/constants';

export function useUndoRedo(ctxRef) {
	const undoStack = useRef([]);
	const redoStack = useRef([]);

	const undo = () => {
		if (undoStack.current.length === 0 || !ctxRef.current) return;
		
		redoStack.current.push(
			ctxRef.current.getImageData(0, 0, WIDTH, HEIGHT)
		);
		
		const last = undoStack.current.pop();
		ctxRef.current.putImageData(last, 0, 0);
	};

	const redo = () => {
		if (redoStack.current.length === 0 || !ctxRef.current) return;
		
		undoStack.current.push(
			ctxRef.current.getImageData(0, 0, WIDTH, HEIGHT)
		);
		
		const next = redoStack.current.pop();
		ctxRef.current.putImageData(next, 0, 0);
	};

	function handleKey(e) {
		if (e.key === "z" && e.ctrlKey && e.repeat === false)
			undo();
		else if (e.key === "y" && e.ctrlKey && e.repeat === false)
			redo();
	}

	useEffect(() => {
		document.addEventListener("keydown", handleKey);

		return () => {document.removeEventListener("keydown", handleKey)}
	});

	const saveSnapshot = () => {
		if (!ctxRef.current) return;
		
		const imageData = ctxRef.current.getImageData(0, 0, WIDTH, HEIGHT);

		undoStack.current.push(imageData);

		if (undoStack.current.length > MAX_HISTORY) {
			undoStack.current.shift();
		}

		redoStack.current = [];
	};

	return { saveSnapshot, undo, redo };
}
