# Assignment 4 — Task Tracker

Express API with the same OpenAPI contract as Assignment 3, backed by Postgres through Prisma. The Vite app calls the API only through the OpenAPI Generator `typescript-fetch` client (no ad-hoc `fetch`).

## Layout

| Path | Role |
|------|------|
| [`server/`](server/) | Express, `openapi-backend`, Prisma, `/docs`, `/openapi.yaml` |
| [`generated-client/`](generated-client/) | Regenerated from the spec; run `npm run generate:client` from `server/` |
| [`client/`](client/) | Vite + TypeScript UI |

## Server (local)

1. Provision Postgres (Supabase, Neon, or local).
2. Copy [`server/.env.example`](server/.env.example) to `server/.env` and set `DATABASE_URL`, `DIRECT_URL`, and optionally `PORT`.

   On Supabase (Project Settings → Database): use the **transaction pooler** for `DATABASE_URL` (often port `6543`, `pgbouncer=true` in the query string) and the **direct** connection for `DIRECT_URL` (port `5432`) so migrations work. For a single local URL, set both to the same value.

3. Migrate, seed, run:

   ```bash
   cd server
   npm ci
   npx prisma migrate deploy
   npm run db:seed
   npm run dev
   ```

   - API: `http://localhost:3000/`
   - Swagger: `http://localhost:3000/docs`
   - Spec: `/openapi.yaml` (JSON: `/openapi.json`)

## Server (Render)

1. Web Service from this repo, **Root Directory** `assignment4/server`.
2. **Build:** `npm ci && npx prisma migrate deploy && npm run build`
3. **Start:** `npm start`
4. **Env:** `DATABASE_URL` (pooler URL on Supabase), `DIRECT_URL` (direct URL for `prisma migrate`). Set `NODE_VERSION` to `20` if the platform needs it.

5. After deploy, set the first `servers` URL in [`server/openapi/openapi.yaml`](server/openapi/openapi.yaml) to your public API origin, then regenerate the client if others rely on the committed spec.

6. Run `npm run db:seed` once in the Render shell if you want seeded data in production.

## Regenerate the client

When the OpenAPI file changes:

```bash
cd server
npm run generate:client
```

Output: `../generated-client/`.

## Client (local)

```bash
cd client
cp .env.example .env
```

Set `VITE_API_BASE_URL` to the API origin (no trailing `/`). Then:

```bash
npm ci
npm run dev
```

## Client (Vercel)

- **Root Directory:** `assignment4/client`
- **Env:** `VITE_API_BASE_URL` = deployed API base URL

## CI

[`.github/workflows/assignment4-ci.yml`](../.github/workflows/assignment4-ci.yml) runs `npm ci` and `npm run build` for `assignment4/server` and `assignment4/client` when paths under `assignment4/` change.

Remove any leftover `assignment4/backend` folder if it still exists next to `server/` (rename artifact).
