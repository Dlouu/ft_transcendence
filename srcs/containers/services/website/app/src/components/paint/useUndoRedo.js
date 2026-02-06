import { useRef } from 'react';
import { WIDTH, HEIGHT } from './constants';

export function useUndoRedo(ctxRef) {
	const undoStack = useRef([]);
	const redoStack = useRef([]);

	const saveSnapshot = () => {
		if (!ctxRef.current) return;
		
		const imageData = ctxRef.current.getImageData(0, 0, WIDTH, HEIGHT);
		undoStack.current.push(imageData);
		redoStack.current = [];
	};

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

	return { saveSnapshot, undo, redo };
}
