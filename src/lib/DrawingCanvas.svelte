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
    let redrawFrame: number | null = null;
    let networkFlushFrame: number | null = null;

    const MAX_POINTS_PER_EMIT = 150;
    const MAX_POINT_GAP_PX = 8;

    // Local stroke state for rendering
    let completedStrokes: Stroke[] = $state([]);
    let activeStroke: Stroke | null = $state(null);
    // Remote active stroke (from artist when we're spectating)
    let remoteActiveStroke: Stroke | null = $state(null);
    let pendingNetworkPoints: Point[] = [];
    let lastStrokePoint: Point | null = null;

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
            if (redrawFrame !== null) {
                cancelAnimationFrame(redrawFrame);
            }
            if (networkFlushFrame !== null) {
                cancelAnimationFrame(networkFlushFrame);
            }
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
    function toNormalizedWithRect(x: number, y: number, rect: DOMRect): Point {
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

    function queueRedraw() {
        if (redrawFrame !== null) return;

        redrawFrame = requestAnimationFrame(() => {
            redrawFrame = null;
            redraw();
        });
    }

    function queueNetworkFlush() {
        if (networkFlushFrame !== null) return;

        networkFlushFrame = requestAnimationFrame(() => {
            networkFlushFrame = null;
            flushPendingNetworkPoints();
        });
    }

    function flushPendingNetworkPoints() {
        if (pendingNetworkPoints.length === 0) return;

        while (pendingNetworkPoints.length > 0) {
            const points = pendingNetworkPoints.splice(0, MAX_POINTS_PER_EMIT);
            socket.emit("stroke:points", { points });
        }
    }

    function getPointerSamples(event: PointerEvent): PointerEvent[] {
        if (typeof event.getCoalescedEvents !== "function") {
            return [event];
        }

        const coalescedEvents = event.getCoalescedEvents();
        return coalescedEvents.length > 0 ? coalescedEvents : [event];
    }

    function appendPointWithDensification(point: Point, rect: DOMRect) {
        if (!activeStroke) return;

        if (!lastStrokePoint) {
            activeStroke.points.push(point);
            pendingNetworkPoints.push(point);
            lastStrokePoint = point;
            return;
        }

        const from = lastStrokePoint;
        const to = point;

        const deltaXPx = (to[0] - from[0]) * rect.width;
        const deltaYPx = (to[1] - from[1]) * rect.height;
        const distancePx = Math.hypot(deltaXPx, deltaYPx);
        const steps = Math.max(1, Math.ceil(distancePx / MAX_POINT_GAP_PX));

        for (let step = 1; step <= steps; step++) {
            const t = step / steps;
            const interpolatedPoint: Point = [
                from[0] + (to[0] - from[0]) * t,
                from[1] + (to[1] - from[1]) * t,
            ];
            activeStroke.points.push(interpolatedPoint);
            pendingNetworkPoints.push(interpolatedPoint);
        }

        lastStrokePoint = point;
    }

    function handlePointerDown(e: PointerEvent) {
        if (disabled || !gameState.isArtist || gameState.phase !== "drawing") return;

        canvas.setPointerCapture(e.pointerId);
        isDrawing = true;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const point = toNormalizedWithRect(x, y, rect);

        activeStroke = {
            points: [],
            color,
            width: brushSize,
        };

        pendingNetworkPoints = [];
        lastStrokePoint = null;
        appendPointWithDensification(point, rect);

        // Render immediately so a single click leaves a visible dot.
        redraw();

        socket.emit("stroke:start", { color, width: brushSize });
        flushPendingNetworkPoints();
    }

    function handlePointerMove(e: PointerEvent) {
        if (!isDrawing || !activeStroke) return;

        const rect = canvas.getBoundingClientRect();
        const samples = getPointerSamples(e);
        for (const sample of samples) {
            const x = sample.clientX - rect.left;
            const y = sample.clientY - rect.top;
            const point = toNormalizedWithRect(x, y, rect);
            appendPointWithDensification(point, rect);
        }

        queueRedraw();
        queueNetworkFlush();
    }

    function handlePointerUp(e: PointerEvent) {
        if (!isDrawing || !activeStroke) return;

        canvas.releasePointerCapture(e.pointerId);
        isDrawing = false;

        if (networkFlushFrame !== null) {
            cancelAnimationFrame(networkFlushFrame);
            networkFlushFrame = null;
        }
        flushPendingNetworkPoints();

        // Move to completed strokes
        completedStrokes = [...completedStrokes, activeStroke];
        activeStroke = null;
        pendingNetworkPoints = [];
        lastStrokePoint = null;

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

        remoteActiveStroke.points.push(...data.points);
        queueRedraw();
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
        pendingNetworkPoints = [];
        lastStrokePoint = null;
        clearCanvas();
    }

    function handleCanvasSync(data: { completedStrokes: Stroke[]; activeStroke: Stroke | null }) {
        completedStrokes = data.completedStrokes;
        remoteActiveStroke = data.activeStroke;
        redraw();
    }

    // Drawing helpers
    function drawStroke(stroke: Stroke) {
        if (!ctx || stroke.points.length === 0) return;

        const points = stroke.points.map((point) => toPixels(point));

        if (points.length === 1) {
            const point = points[0];
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

        const first = points[0];
        ctx.moveTo(first.x, first.y);

        if (points.length === 2) {
            const second = points[1];
            ctx.lineTo(second.x, second.y);
            ctx.stroke();
            return;
        }

        for (let i = 1; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];
            const midpointX = (current.x + next.x) / 2;
            const midpointY = (current.y + next.y) / 2;
            ctx.quadraticCurveTo(current.x, current.y, midpointX, midpointY);
        }

        const secondLast = points[points.length - 2];
        const last = points[points.length - 1];
        ctx.quadraticCurveTo(secondLast.x, secondLast.y, last.x, last.y);

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
