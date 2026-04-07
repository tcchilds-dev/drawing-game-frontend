# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start Vite dev server
pnpm build      # Production build to dist/
pnpm check      # Svelte + TypeScript type checking
pnpm preview    # Preview production build
```

Requires Node.js 22+ and pnpm 10+.

Set `VITE_SOCKET_URL` in `.env` (see `.env.example`) to point at the backend Socket.IO server. Defaults to `http://localhost:3000`.

## Architecture

A Svelte 5 + TypeScript multiplayer drawing game (Pictionary-style). Uses Vite, Tailwind CSS v4 + daisyUI ("coffee" theme), and Socket.IO for real-time communication.

### Screen routing

`App.svelte` manages all navigation via a local `screen` variable (`"name" | "lobby" | "join" | "create" | "game" | "reconnecting"`). There is no router library — screens are conditionally rendered based on `screen` and `gameState.phase`.

### State management

All game state lives in `src/lib/gameState.svelte.ts` as a single exported `gameState` object using **Svelte 5 runes** (`$state`, `$derived`, `$effect`). There are no external store libraries. The file exposes both reactive state properties and async action methods (e.g. `setUsername()`, `createRoom()`, `leaveRoom()`).

Session persistence uses `sessionStorage` to store `playerId` and `gameSession` (username + roomId), enabling automatic reconnection on page refresh.

### Socket.IO layer

`src/lib/socket.ts` defines the full TypeScript event contract (`ServerToClientEvents`, `ClientToServerEvents`) and exports the typed socket instance. The socket is imported directly into `gameState.svelte.ts` where all event handlers are registered. Acknowledgment callbacks are used for RPC-style operations (username set, room create/join).

Key event categories:
- Room/game lifecycle: `room:update`, `round:start`, `round:end`, `game:end`
- Drawing sync: `stroke:start`, `stroke:points`, `stroke:end`, `canvas:sync`
- Word state: `word:choice` (artist), `word:mask` (guessers), `word:hint`
- Timer: `timer:sync`

### Drawing canvas

`src/lib/DrawingCanvas.svelte` renders strokes on an HTML5 canvas. Important implementation details:
- Points are stored as **normalized [0,1] coordinates** (device-agnostic)
- Points are densified (interpolated when gap > 8px) for smooth curves
- Network batches accumulate points up to 150 before emitting, throttled via `requestAnimationFrame`
- `getCoalescedEvents()` is used for high-precision pointer input
- Canvas scales by device pixel ratio (DPR) for crisp rendering

### Sound effects

`src/lib/sfx.ts` exports a `playSfx(effect)` helper. Each effect has its own volume setting with a master volume of 0.2. Audio files are expected in `public/`; missing files log a warning but don't throw.

### Game phases

`lobby` → `wordSelection` → `drawing` → `roundEnd` → (repeat) → final standings. Phase transitions are driven by socket events and reflected in `gameState.phase`.

### Deployment

Targets Cloudflare Pages. Build output is `dist/`. See `DEPLOYMENT.md` for setup.
