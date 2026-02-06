<script lang="ts">
    import { onMount } from "svelte";
    import { socket, type Point, type Stroke } from "./socket";
    import { gameState } from "./gameState.svelte";

    interface Props {
        color: string;
        brushSize: number;
        disabled?: boolean;
    }

    let { color, brushSize, disabled = false }: Props = $props();

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null = null;
    let isDrawing = $state(false);
    let lastPoint: Point | null = null;

    // Local stroke state for rendering
    let completedStrokes: Stroke[] = $state([]);
    let activeStroke: Stroke | null = $state(null);
    // Remote active stroke (from artist when we're spectating)
    let remoteActiveStroke: Stroke | null = $state(null);

    // Cursor SVG for artist
    const cursorSvg = $derived(() => {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg"
          width="${brushSize}" height="${brushSize}" viewBox="0 0 ${brushSize} ${brushSize}">
          <circle cx="${brushSize / 2}" cy="${brushSize / 2}" r="${brushSize / 2 - 1}" fill="${color}"
          stroke="black" stroke-width="1"/></svg>`;
        return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${brushSize / 2} ${brushSize / 2}, crosshair`;
    });

    onMount(() => {
        ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set up canvas size
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        // Set up socket listeners
        socket.on("stroke:start", handleRemoteStrokeStart);
        socket.on("stroke:points", handleRemoteStrokePoints);
        socket.on("stroke:end", handleRemoteStrokeEnd);
        socket.on("canvas:clear", handleRemoteClear);
        socket.on("canvas:sync", handleCanvasSync);

        // Initial sync from room state if available
        if (gameState.room?.drawingState) {
            completedStrokes = [...gameState.room.drawingState.completedStrokes];
            remoteActiveStroke = gameState.room.drawingState.activeStroke;
            redraw();
        }

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            socket.off("stroke:start", handleRemoteStrokeStart);
            socket.off("stroke:points", handleRemoteStrokePoints);
            socket.off("stroke:end", handleRemoteStrokeEnd);
            socket.off("canvas:clear", handleRemoteClear);
            socket.off("canvas:sync", handleCanvasSync);
        };
    });

    function resizeCanvas() {
        if (!canvas || !ctx) return;

        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        ctx.scale(dpr, dpr);
        redraw();
    }

    // Convert pixel coordinates to normalized [0, 1]
    function toNormalized(x: number, y: number): Point {
        const rect = canvas.getBoundingClientRect();
        return [x / rect.width, y / rect.height];
    }

    // Convert normalized coordinates back to pixels
    function toPixels(point: Point): { x: number; y: number } {
        const rect = canvas.getBoundingClientRect();
        return {
            x: point[0] * rect.width,
            y: point[1] * rect.height,
        };
    }

    function handlePointerDown(e: PointerEvent) {
        if (disabled || !gameState.isArtist || gameState.phase !== "drawing") return;

        canvas.setPointerCapture(e.pointerId);
        isDrawing = true;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const point = toNormalized(x, y);

        lastPoint = point;
        activeStroke = {
            points: [point],
            color,
            width: brushSize,
        };

        // Render immediately so a single click leaves a visible dot.
        redraw();

        socket.emit("stroke:start", { color, width: brushSize });
        socket.emit("stroke:points", { points: [point] });
    }

    function handlePointerMove(e: PointerEvent) {
        if (!isDrawing || !activeStroke || !ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const point = toNormalized(x, y);

        // Draw line segment
        if (lastPoint) {
            drawLineSegment(lastPoint, point, activeStroke.color, activeStroke.width);
        }

        activeStroke.points.push(point);
        lastPoint = point;

        // Batch points for network efficiency (send every few points)
        socket.emit("stroke:points", { points: [point] });
    }

    function handlePointerUp(e: PointerEvent) {
        if (!isDrawing || !activeStroke) return;

        canvas.releasePointerCapture(e.pointerId);
        isDrawing = false;

        // Move to completed strokes
        completedStrokes = [...completedStrokes, activeStroke];
        activeStroke = null;
        lastPoint = null;

        socket.emit("stroke:end");
        redraw();
    }

    function handlePointerLeave(e: PointerEvent) {
        if (isDrawing) {
            handlePointerUp(e);
        }
    }

    // Remote event handlers
    function handleRemoteStrokeStart(data: { playerId: string; color: string; width: number }) {
        if (data.playerId === gameState.playerId) return;

        remoteActiveStroke = {
            points: [],
            color: data.color,
            width: data.width,
        };
    }

    function handleRemoteStrokePoints(data: { playerId: string; points: Point[] }) {
        if (data.playerId === gameState.playerId) return;
        if (!remoteActiveStroke) return;

        // Draw new segments
        for (let i = 0; i < data.points.length; i++) {
            const newPoint = data.points[i];
            const prevPoint =
                i === 0
                    ? remoteActiveStroke.points[remoteActiveStroke.points.length - 1]
                    : data.points[i - 1];

            if (prevPoint) {
                drawLineSegment(
                    prevPoint,
                    newPoint,
                    remoteActiveStroke.color,
                    remoteActiveStroke.width,
                );
            }

            remoteActiveStroke.points.push(newPoint);
        }
    }

    function handleRemoteStrokeEnd() {
        if (remoteActiveStroke) {
            completedStrokes = [...completedStrokes, remoteActiveStroke];
            remoteActiveStroke = null;
            redraw();
        }
    }

    function handleRemoteClear() {
        completedStrokes = [];
        activeStroke = null;
        remoteActiveStroke = null;
        clearCanvas();
    }

    function handleCanvasSync(data: { completedStrokes: Stroke[]; activeStroke: Stroke | null }) {
        completedStrokes = data.completedStrokes;
        remoteActiveStroke = data.activeStroke;
        redraw();
    }

    // Drawing helpers
    function drawLineSegment(from: Point, to: Point, strokeColor: string, strokeWidth: number) {
        if (!ctx) return;

        const fromPixels = toPixels(from);
        const toPixels_ = toPixels(to);

        ctx.beginPath();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.moveTo(fromPixels.x, fromPixels.y);
        ctx.lineTo(toPixels_.x, toPixels_.y);
        ctx.stroke();
    }

    function drawStroke(stroke: Stroke) {
        if (!ctx || stroke.points.length === 0) return;

        if (stroke.points.length === 1) {
            const point = toPixels(stroke.points[0]);
            const radius = Math.max(1, stroke.width / 2);
            ctx.beginPath();
            ctx.fillStyle = stroke.color;
            ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        ctx.beginPath();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        const first = toPixels(stroke.points[0]);
        ctx.moveTo(first.x, first.y);

        for (let i = 1; i < stroke.points.length; i++) {
            const point = toPixels(stroke.points[i]);
            ctx.lineTo(point.x, point.y);
        }

        ctx.stroke();
    }

    function clearCanvas() {
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);
    }

    function redraw() {
        clearCanvas();

        // Draw all completed strokes
        for (const stroke of completedStrokes) {
            drawStroke(stroke);
        }

        // Draw active stroke (local)
        if (activeStroke) {
            drawStroke(activeStroke);
        }

        // Draw remote active stroke
        if (remoteActiveStroke) {
            drawStroke(remoteActiveStroke);
        }
    }

    // Public methods for undo/clear buttons
    export function undo() {
        if (!gameState.isArtist || gameState.phase !== "drawing") return;
        socket.emit("canvas:undo");
    }

    export function clear() {
        if (!gameState.isArtist || gameState.phase !== "drawing") return;
        socket.emit("canvas:clear");
        // Local clear happens via socket event
    }
</script>

<canvas
    bind:this={canvas}
    class="w-full h-full bg-white touch-none"
    style:cursor={gameState.isArtist && gameState.phase === "drawing" ? cursorSvg() : "default"}
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    onpointerleave={handlePointerLeave}
></canvas>
