# Assignment 4 — Task Tracker (cloud DB + generated client + deploy)

Keeps the same OpenAPI contract and Express handlers as Assignment 3, swaps the **data layer** to Prisma + Postgres (Supabase, Neon, etc.), and adds a minimal Vite client that calls the OpenAPI Generator **typescript-fetch** SDK.

## Layout

| Path | Description |
|------|-------------|
| [`server/`](server/) | Express + `openapi-backend`, Prisma, `/docs`, `/openapi.yaml` |
| [`generated-client/`](generated-client/) | OpenAPI Generator output (do not edit by hand; regenerate with the script below) |
| [`client/`](client/) | Vite + TypeScript — uses SDK methods only (no raw `fetch`) |

## Server — local

1. Create a Postgres database (e.g. Supabase or Neon) and copy the **connection string(s)**.
2. Add them to `server/.env` (see [`server/.env.example`](server/.env.example)).

   ```env
   DATABASE_URL="postgresql://..."
   DIRECT_URL="postgresql://..."
   PORT=3000
   ```

   **Supabase:** In the dashboard go to **Project Settings → Database** and use two connection strings:

   - **`DATABASE_URL`** — **Transaction pooler** (host contains `pooler`, port **6543**). The query string should include `pgbouncer=true` (add it if missing). This is what the running app uses for queries.
   - **`DIRECT_URL`** — **Direct connection** (host `db.<project-ref>.supabase.co`, port **5432**). Prisma uses this for **migrations** (`prisma migrate`).

   **Local Postgres only:** If a single direct URL on port 5432 is enough, you may set **`DATABASE_URL` and `DIRECT_URL` to the same value**.

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
4. **Environment:** Set `DATABASE_URL` (Supabase **transaction pooler** / 6543), `DIRECT_URL` (**direct** / 5432), and `NODE_VERSION` **20** (recommended). Hosted platforms often **cannot** reach Supabase on port **5432** from the app runtime, so the app typically uses the **pooler** URL for `DATABASE_URL` while migrations still need `DIRECT_URL` for schema changes.
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

If an old `assignment4/backend` directory still exists alongside `server/`, delete it so only `assignment4/server/` remains (leftover from a folder rename).
