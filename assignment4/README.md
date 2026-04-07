# Assignment 4 — Task Tracker (cloud DB + generated client + deploy)

Keeps the same OpenAPI contract and Express handlers as Assignment 3, swaps the **data layer** to Prisma + Postgres (Supabase, Neon, etc.), and adds a minimal Vite client that calls the OpenAPI Generator **typescript-fetch** SDK.

## Layout

| Path | Description |
|------|-------------|
| [`server/`](server/) | Express + `openapi-backend`, Prisma, `/docs`, `/openapi.yaml` |
| [`generated-client/`](generated-client/) | OpenAPI Generator output (do not edit by hand; regenerate with the script below) |
| [`client/`](client/) | Vite + TypeScript — uses SDK methods only (no raw `fetch`) |

## Server — local

1. Create a Postgres database (e.g. Supabase or Neon) and copy the **connection string**.
2. Add it to `server/.env` (see [`server/.env.example`](server/.env.example)).

   ```env
   DATABASE_URL="postgresql://..."
   PORT=3000
   ```

3. Migrate and seed:

   ```bash
   cd server
   npm ci
   npx prisma migrate deploy
   npm run db:seed
   ```

4. Run:

   ```bash
   npm run dev
   ```

   - API: `http://localhost:3000/`
   - Swagger UI: `http://localhost:3000/docs`
   - Spec: `http://localhost:3000/openapi.yaml`

## Server — Render (Assignment 4 URL)

1. New Web Service → connect this repo, **Root Directory** `assignment4/server`.
2. **Build command:** `npm ci && npx prisma migrate deploy && npm run build`
3. **Start command:** `npm start`
4. Environment: `DATABASE_URL` (Supabase or other Postgres URL), `NODE_VERSION` 20 recommended.
5. After deploy, set `servers[0].url` in [`server/openapi/openapi.yaml`](server/openapi/openapi.yaml) to the real public URL (current placeholder: `https://itmd444-assignment4-task.onrender.com`).
6. Run `npm run db:seed` once in the Render Shell if you need seed data (or seed locally using the same `DATABASE_URL`).

## Regenerating the client

After you change `openapi.yaml`:

```bash
cd server
npm run generate:client
```

Output always goes to `../generated-client/`.

## Client — local

```bash
cd client
cp .env.example .env
# Set VITE_API_BASE_URL in .env to your local or deployed API
npm ci
npm run dev
```

## Client — Vercel

- Project **Root Directory:** `assignment4/client`
- Environment variable: `VITE_API_BASE_URL` = deployed API base URL (no trailing `/`)

## CI

Pushes under `assignment4/**` run `npm ci` and `npm run build` for both the server package and the client (see `.github/workflows/assignment4-ci.yml`).

If an old `assignment4/backend` directory still exists alongside `server/`, delete it so only `assignment4/server/` remains (duplicate copy from a rename).
