import { useEffect, useContext, useRef, useState } from "react";
import { Page, Button } from "../ui";
import { gameService } from "../services/gameService";
import { AuthContext } from "../context/AuthContext";

const TABLE_ASPECT_RATIO = 16 / 9;

function getFitted16By9Size(availableWidth, availableHeight)
{
    const safeWidth = Math.max(1, Math.floor(availableWidth));
    const safeHeight = Math.max(1, Math.floor(availableHeight));

    let width = safeWidth;
    let height = Math.floor(width / TABLE_ASPECT_RATIO);

    if (height > safeHeight)
    {
        height = safeHeight;
        width = Math.floor(height * TABLE_ASPECT_RATIO);
    }

    return {
        width: Math.max(1, width),
        height: Math.max(1, height),
    };
}

function Game() {
    const { user } = useContext(AuthContext);

    const canvasRef = useRef(null);
    const stageRef = useRef(null);
    const containerRef = useRef(null);

    const [portrait, setPortrait] = useState(false);
	const [tableSize, setTableSize] = useState({ width: 1280, height: 720 });
	const userId = user?.user_id;

    useEffect(() =>
    {
        if (!canvasRef.current || !userId) return;

        let isCancelled = false;

        return () => gameService.destroy();
    }, [playerName, userId]);

    const enterFullscreen = () =>
    {
        const el = stageRef.current;
        if (!el) return;

        if (el.requestFullscreen) {
            el.requestFullscreen();
        }
    };

    useEffect(() => {
        const check = () => {
            const portrait = window.matchMedia("(orientation: portrait)").matches;
            const mobile = window.matchMedia("(pointer: coarse)").matches;

            setPortrait((prev) => {
                const next = portrait && mobile;
                return prev === next ? prev : next;
            });
        };

        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    useEffect(() =>
    {
        const stage = stageRef.current;
        if (!stage) return;

        const updateTableSize = () =>
        {
            const bounds = stage.getBoundingClientRect();
            const fitted = getFitted16By9Size(bounds.width, bounds.height);
            setTableSize((prev) =>
            {
                if (prev.width === fitted.width && prev.height === fitted.height)
                {
                    return prev;
                }

                return fitted;
            });
        };

        const observer = new ResizeObserver(() => updateTableSize());
        observer.observe(stage);

        updateTableSize();
        window.addEventListener("resize", updateTableSize);
        document.addEventListener("fullscreenchange", updateTableSize);

        return () =>
        {
            observer.disconnect();
            window.removeEventListener("resize", updateTableSize);
            document.removeEventListener("fullscreenchange", updateTableSize);
        };
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

        const observer = new ResizeObserver(() => resize());
        observer.observe(container);

        resize();
        window.addEventListener("resize", resize);
        return () =>
        {
            observer.disconnect();
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <Page className="h-screen overflow-hidden flex flex-col">
            <div
                ref={stageRef}
                className="flex-1 w-full flex items-center justify-center p-4"
            >
                <div
                    ref={containerRef}
                    className="relative shadow-2xl rounded-4xl"
                    style={{ width: `${tableSize.width}px`, height: `${tableSize.height}px` }}
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
