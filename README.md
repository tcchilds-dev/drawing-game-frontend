# Drawing Game Frontend

Svelte + Vite frontend for the multiplayer drawing game.  
Players can create or join rooms, draw in real time, chat guesses, and reconnect to an active room session.

## Tech Stack

- Svelte 5
- TypeScript
- Vite
- Tailwind CSS v4 + daisyUI
- Socket.IO client

## Requirements

- Node.js 22+
- pnpm 10+

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Create local env file:

```bash
cp .env.example .env
```

3. Set backend URL in `.env`:

```env
VITE_SOCKET_URL=http://localhost:3000
```

4. Start the dev server:

```bash
pnpm dev
```

## Scripts

- `pnpm dev` - run local dev server
- `pnpm build` - production build to `dist/`
- `pnpm preview` - preview production build locally
- `pnpm check` - Svelte + TypeScript checks

## Core Behavior

- Persists a client `playerId` and room session in `sessionStorage`.
- Attempts automatic reconnection to the previous room on refresh/reconnect.
- Uses server-synced timers and room updates over Socket.IO.
- Artist-only controls for drawing, undo, and clear.

## Environment Variables

- `VITE_SOCKET_URL` (required in production): public URL of the backend Socket.IO server.

Example:

```env
VITE_SOCKET_URL=https://drawing-game-backend.onrender.com
```

## Deployment

Primary deployment target is Cloudflare.

- Cloudflare Pages build command: `pnpm run build`
- Build output directory: `dist`
- Build env var: `VITE_SOCKET_URL=https://<your-render-service>.onrender.com`

If your Cloudflare setup uses a Wrangler deploy step, this repo includes `wrangler.jsonc` configured to publish static assets from `dist/`.

See `DEPLOYMENT.md` for step-by-step setup.

## Troubleshooting

- App loads but cannot connect:
  - Confirm `VITE_SOCKET_URL` points to the live backend URL.
  - Confirm backend `CORS_ORIGIN` includes the exact frontend origin.
- First connection is slow:
  - Render free services can cold start after idle periods.

## Project Structure

- `src/App.svelte` - top-level screen orchestration
- `src/lib/gameState.svelte.ts` - client game/session/socket state
- `src/lib/DrawingCanvas.svelte` - canvas rendering + drawing sync
- `src/lib/socket.ts` - typed Socket.IO client and event contracts
