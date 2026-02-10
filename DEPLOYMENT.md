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

## If You Are Using Cloudflare "Workers Builds"

If your logs show a separate deploy step like `Executing user deploy command: npx wrangler deploy`, keep this in repo:

1. `wrangler.jsonc` with `assets.directory = "./dist"`

Then use:

1. Build command: `pnpm run build`
2. Deploy command: `npx wrangler deploy`
