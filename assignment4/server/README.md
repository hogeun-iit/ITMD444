# Task Tracker API (Assignment 4)

The OpenAPI 3.1 contract (`openapi/openapi.yaml`) matches Assignment 3; **persistence** uses Postgres via Prisma.

## Database schema

Single table `tasks` (Prisma model `Task`):

| Column (DB) | Type | Description |
|-------------|------|-------------|
| `id` | `TEXT` PK | `task-{uuid}` format |
| `title` | `TEXT` | Title |
| `assignee` | `TEXT` | Assignee name |
| `status` | enum `TaskStatus` | `TODO`, `IN_PROGRESS`, `DONE` |
| `priority` | enum `TaskPriority` | `LOW`, `MEDIUM`, `HIGH` |
| `estimate_hours` | `INTEGER` | Estimated hours |
| `due_date` | `TIMESTAMP(3)` | Due date stored in UTC; API exposes `YYYY-MM-DD` strings |

`GET /stats` aggregates over this table.

## Environment variables

See [`./.env.example`](./.env.example). Required: `DATABASE_URL`.

## Run locally

```bash
npm ci
npx prisma migrate deploy
npm run db:seed
npm run dev
```

- Swagger UI: `/docs`
- OpenAPI: `/openapi.yaml`, `/openapi.json`

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Run server with `ts-node` |
| `npm run build` | `openapi-typescript` + `prisma generate` + `tsc` |
| `npm start` | Run `dist/server.js` |
| `npm run generate:types` | Regenerate `src/types/generated.ts` |
| `npm run generate:client` | Regenerate `../generated-client` (OpenAPI Generator) |
| `npm run db:migrate` | `prisma migrate deploy` |
| `npm run db:seed` | Upsert seed data |

## Deploy (Render)

- **Root Directory:** `assignment4/server`
- **Build:** `npm ci && npx prisma migrate deploy && npm run build`
- **Start:** `npm start`
- **Env:** `DATABASE_URL` (Supabase or other Postgres connection string)

After deploy, set the first entry under `servers` in `openapi/openapi.yaml` to your public URL.
