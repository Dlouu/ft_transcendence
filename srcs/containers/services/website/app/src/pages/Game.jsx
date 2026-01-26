import { useEffect, useContext, useRef, useState } from "react";
import { GameContext } from "../context/GameContext";
import { Page, Button } from "../ui";

function Game() {
	const { playerName, gameState, socket } = useContext(GameContext);

	const canvasRef = useRef(null);
	const containerRef = useRef(null);

	const [portrait, setPortrait] = useState(false);

	const enterFullscreen = () => {
		const el = containerRef.current;
		if (!el) return;

		if (el.requestFullscreen) el.requestFullscreen();
	};

	const isMobile = () =>
		window.matchMedia("(pointer: coarse)").matches;

	useEffect(() => {
		const check = () => {
			const portrait =
				window.matchMedia("(orientation: portrait)").matches;
			const mobile =
				window.matchMedia("(pointer: coarse)").matches;

		setPortrait(portrait && mobile);
		};

		check();
		window.addEventListener("resize", check);
		return () => window.removeEventListener("resize", check);
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		const container = containerRef.current;
		if (!canvas || !container) return;

		const ctx = canvas.getContext("2d");

		const resize = () => {
			const dpr = window.devicePixelRatio || 1;
			const { width, height } = container.getBoundingClientRect();

			canvas.width = width * dpr;
			canvas.height = height * dpr;

			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};

		resize();
		window.addEventListener("resize", resize);
		return () => window.removeEventListener("resize", resize);
	}, []);


	useEffect(() => {
		console.log("Game mounted for", playerName);
		//init canvas ici

		return () => {
			console.log("Game unmounted");
		};
	}, [playerName]);

	return (

		<Page className="h-screen overflow-hidden">
			<div className="w-full h-full flex items-center justify-center">
				<div
					ref={containerRef}
					className="w-full h-full max-w-none aspect-video"
				>
					<canvas
						ref={canvasRef}
						className="w-full h-full bg-white"
					/>
					<Button
						variant="fullscreen"
						onClick={enterFullscreen}
					>
						⌞ ⌝
					</Button>
				</div>

				{/* <pre>{JSON.stringify(gameState, null, 2)}</pre> */}
			</div>

			{portrait && (
				<div className="fixed inset-0 z-50 bg-black text-white flex flex-col items-center justify-center text-center p-6">
					<p className="text-xl font-bold mb-4">
						Rotate your device
					</p>
					<p>UwUNO is playable in landscape mode only.</p>
				</div>
			)}
		</Page>
	);
}

export default Game;
