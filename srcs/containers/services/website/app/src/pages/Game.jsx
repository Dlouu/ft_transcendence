import { useEffect, useContext, useRef, useState } from "react";
import { GameContext } from "../context/GameContext";
import { Page, Button } from "../ui";
import { gameService } from "../services/gameService";
import { AuthContext } from "../context/AuthContext";

function Game() {
    const { playerName } = useContext(GameContext);
    const { user } = useContext(AuthContext);

    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    const [portrait, setPortrait] = useState(false);
	const userId = user?.user_id;

    useEffect(() =>
    {
        if (!canvasRef.current) return;

        gameService.init({ canvas: canvasRef.current, playerId: userId });
        console.log("Game mounted for", playerName);

        return () => gameService.destroy();
    });

    const enterFullscreen = () =>
    {
        console.log("Game unmounted");
        const el = canvasRef.current;
        if (!el) return;

        if (el.requestFullscreen)
        {
            el.requestFullscreen();
        }
    };

    useEffect(() =>
    {
        const check = () =>
        {
            const portrait = window.matchMedia("(orientation: portrait)").matches;
            const mobile = window.matchMedia("(pointer: coarse)").matches;

            setPortrait(portrait && mobile);
        };

        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    useEffect(() =>
    {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const resize = () =>
        {
            const { width, height } = container.getBoundingClientRect();

            gameService.onResize?.(width, height);
        };

        resize();
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, []);

    return (
        <Page className="h-screen overflow-hidden flex flex-col">
            <div className="flex-1 w-full flex items-center justify-center p-4">
                <div
                    ref={containerRef}
                    className="relative w-full max-w-7xl aspect-video shadow-2xl rounded-4xl"
                >
                    <canvas
                        ref={canvasRef}
                        className="block w-full h-full rounded-4xl overflow-hidden"
                    />

                    <div className="absolute bottom-4 left-4 z-10">
                        <Button
                            variant="fullscreen"
                            onClick={enterFullscreen}
                        >
                            ⌞ ⌝
                        </Button>
                    </div>
                </div>
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
