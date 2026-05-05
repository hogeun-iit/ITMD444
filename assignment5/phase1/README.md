# Assignment 5 ? Phase 1 (TubeDeck REST, `assignment5/backend-dev-api.md`)

Monolithic Phase 1 API: **four tables** (`users`, `decks`, `videos`, `video_analyses`), resource paths **`/users/{userId}/videos`** and **`/videos`**, **session cookie** auth (demo email login), Swagger **`/docs`**.

## Stack

- Node.js 18+, TypeScript, Fastify 5, `@fastify/cookie` + `@fastify/session`
- Prisma 5 + **PostgreSQL** ? `DATABASE_URL` + `DIRECT_URL` (see `.env.example`)
- **`SESSION_SECRET`** ? at least **32 characters** (required when `NODE_ENV=production`)
- Optional **`YOUTUBE_API_KEY`** ? real YouTube Data API metadata on `POST /videos`; otherwise mock titles/thumbnails
- Zod validation, OpenAPI 3.1 + Swagger UI
- Tests: **Vitest** (`npm test`)

## REST routes (Phase 1)

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/health` | No auth |
| `POST` | `/auth/login` | Body `{ "email" }` ? passwordless demo; sets **session cookie** |
| `POST` | `/auth/logout` | Clears session |
| `GET` | `/auth/me` | Current user from session |
| `GET` | `/users/:userId/videos` | Paginated list (non-archived); **must be same user as session** |
| `GET` | `/videos/:videoId` | Detail; **owner only** |
| `POST` | `/videos` | Body `userId`, `deckId`, `youtubeUrl` ? **`userId` must match session** |
| `PUT` | `/videos/:videoId` | Partial update; **owner only** |
| `DELETE` | `/videos/:videoId` | **Hard-delete** row (+ cascaded `video_analysis`); **owner only**; second delete ¡æ **404** |

## Run locally

```bash
cd assignment5/phase1
copy .env.example .env   # set DATABASE_URL, DIRECT_URL, SESSION_SECRET (¡Ã32 chars)
npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`

### Example: sign in then save a video

1. `POST /auth/login` with `{ "email": "alice@example.com" }` (from seed) ? store the `Set-Cookie` header (or use a browser).
2. `POST /videos` with the same session cookie:

```json
{
  "userId": "<user-uuid-from-seed>",
  "deckId": "<deck-uuid-from-seed>",
  "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

Resolve ids via `npx prisma studio` or seed console output.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server |
| `npm run build` | `tsc` ¡æ `dist/` |
| `npm run lint` | Typecheck |
| `npm test` | Vitest |

## CI

GitHub Actions: Postgres service ¡æ `prisma migrate deploy` ¡æ `npm run build` ¡æ `npm test`.
