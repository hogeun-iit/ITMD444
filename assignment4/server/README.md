# Task Tracker API (Assignment 4)

Contract: `openapi/openapi.yaml` (same operations as Assignment 3). Persistence: Postgres via Prisma.

## Database

Table `tasks`, model `Task`:

| Column (DB) | Type | Notes |
|-------------|------|--------|
| `id` | `TEXT` PK | `task-{uuid}` |
| `title`, `assignee` | `TEXT` | |
| `status` | enum `TaskStatus` | `TODO`, `IN_PROGRESS`, `DONE` |
| `priority` | enum `TaskPriority` | `LOW`, `MEDIUM`, `HIGH` |
| `estimate_hours` | `INTEGER` | |
| `due_date` | `TIMESTAMP(3)` | UTC in DB; API uses `format: date` (`YYYY-MM-DD`) |

Statistics are computed from this table.

## Environment

See [`.env.example`](./.env.example). `prisma/schema.prisma` expects:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Runtime queries. On Supabase, prefer the transaction pooler (port `6543`, `pgbouncer=true`). |
| `DIRECT_URL` | Migrations (`prisma migrate`). Direct connection (port `5432`). Can match `DATABASE_URL` for a simple local DB. |
| `PORT` | Optional; default `3000`. |

## Local run

```bash
npm ci
npx prisma migrate deploy
npm run db:seed
npm run dev
```

- Swagger UI: `/docs`
- Spec: `/openapi.yaml`, `/openapi.json`

## Scripts

| Script | What it does |
|--------|----------------|
| `npm run dev` | `ts-node src/server.ts` |
| `npm run build` | `prebuild` runs `openapi-typescript` + `prisma generate`, then `tsc` → `dist/server.js` |
| `npm start` | `node dist/server.js` |
| `npm run generate:types` | Refresh `src/types/generated.ts` |
| `npm run generate:client` | Regenerate `../generated-client` |
| `npm run db:migrate` | `prisma migrate deploy` |
| `npm run db:seed` | Seed data |

## Render

Root directory `assignment4/server`. Build: `npm ci && npx prisma migrate deploy && npm run build`. Start: `npm start`. Env vars as above.

Point the production entry under `servers` in `openapi/openapi.yaml` at your live URL after deploy.
