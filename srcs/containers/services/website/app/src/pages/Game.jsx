import { useEffect, useContext, useRef, useState } from "react";
import { GameContext } from "../context/GameContext";
import { Page, Button } from "../ui";
import { gameService } from "../services/game/gameService";
import { AuthContext } from "../context/AuthContext";

const CANVAS_ASPECT_RATIO = 16 / 9;
const MAX_CANVAS_WIDTH = 1280;

function Game() {
    const { playerName } = useContext(GameContext);
    const { user } = useContext(AuthContext);

    const canvasRef = useRef(null);
    const stageRef = useRef(null);

    const [portrait, setPortrait] = useState(false);
	const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });
	const userId = user?.user_id;

    useEffect(() =>
    {
        if (!canvasRef.current || !userId) return;

        gameService.init({ canvas: canvasRef.current, playerId: userId });
        console.log("Game mounted for", playerName);

        return () => gameService.destroy();
    }, [playerName, userId]);

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
        const stage = stageRef.current;
        if (!stage) return;

        const resize = () =>
        {
            const { width: availableWidth, height: availableHeight } = stage.getBoundingClientRect();
            const maxWidthFromHeight = availableHeight * CANVAS_ASPECT_RATIO;
            const nextWidth = Math.max(
                1,
                Math.floor(
                    Math.min(availableWidth, maxWidthFromHeight, MAX_CANVAS_WIDTH),
                ),
            );
            const nextHeight = Math.max(1, Math.floor(nextWidth / CANVAS_ASPECT_RATIO));

            setFrameSize((current) =>
                current.width === nextWidth && current.height === nextHeight
                    ? current
                    : { width: nextWidth, height: nextHeight },
            );

            gameService.onResize?.(nextWidth);
        };

        resize();
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, []);

    return (
        <Page className="h-full min-h-0 overflow-hidden flex flex-col">
            <div
                ref={stageRef}
                className="flex-1 min-h-0 w-full overflow-hidden flex items-center justify-center p-4"
            >
                <div
                    className="relative w-full max-w-7xl aspect-video shadow-2xl rounded-4xl"
                    style={{
                        width: frameSize.width ? `${frameSize.width}px` : undefined,
                        height: frameSize.height ? `${frameSize.height}px` : undefined,
                    }}
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