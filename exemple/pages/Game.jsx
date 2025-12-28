import { useEffect, useRef } from "react";

function Game({ onExit }) {
	const canvasRef = useRef(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const resize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};

		resize();
		window.addEventListener("resize", resize);

		return () => window.removeEventListener("resize", resize);
	}, []);

	return (
		<div className="game-screen">
			<canvas ref={canvasRef} />
			<div className="ui-overlay">
				<button onClick={onExit}>Exit</button>
			</div>
		</div>
	);
}

export default Game;
