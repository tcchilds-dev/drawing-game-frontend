# Deploy Frontend to Cloudflare Pages

## Build Settings

Use these values in Cloudflare Pages:

1. Build command: `pnpm run build`
2. Build output directory: `dist`
3. Root directory: `/` (or `drawing-game-frontend` if deploying from a monorepo)

## Environment Variables

Set:

1. `VITE_SOCKET_URL=https://<your-render-service>.onrender.com`

The frontend socket client reads this value at build time from `src/lib/socket.ts`.

## Backend CORS Requirement

On the backend (`drawing-game-backend`), set:

1. `CORS_ORIGIN=https://<your-cloudflare-pages-domain>`

You can allow multiple frontend origins with a comma-separated value.
