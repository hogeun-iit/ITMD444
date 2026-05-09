# TubeDeck Full-Stack (`project/`)

This is a **microservices-based** TubeDeck implementation aligned with `project/PRD.md` and `project/backend-project-requirement.md`.

## Architecture

| Component | Responsibility | Default Port |
|---------|------|------------|
| **web** | Next.js (App Router), Auth.js (Google), UI consuming GraphQL | 3000 |
| **gateway** | GraphQL Yoga BFF, orchestration across downstream services | 4000 |
| **auth-service** | User sync and lookup (Prisma / `tubedeck_auth`) | 4001 |
| **queue-service** | Deck, queue, and review logs (`tubedeck_queue`) | 4002 |
| **video-service** | YouTube Data API + transcripts, video CRUD (`tubedeck_video`) | 4003 |
| **analysis-service** | OpenAI digest generation (`tubedeck_analysis`) | 4004 |
| **analytics-service** | Dashboard aggregation (stateless, composed from other services) | 4005 |

The system uses a **single PostgreSQL instance** with **schema-level ownership separation** (no cross-schema foreign keys; IDs crossing service boundaries are opaque UUIDs).

## Requirement Mapping

- **DB**: Models 4+ tables with relationships including 1:N / N:M patterns (tags are currently stored as JSON arrays in analysis output, extensible per PRD).
- **API**: Public contract is **GraphQL** (`/graphql`) with GraphiQL landing page; service-to-service calls use REST (`/internal/*`).
- **External APIs**: YouTube Data API v3, OpenAI API.
- **Frontend**: Next.js SPA-style UI (dashboard, decks, videos).
- **Logging**: **Pino** in each service.
- **Testing**: Vitest (health checks and YouTube ID unit test).
- **Docker / Compose**: Per-service `Dockerfile`, root `docker-compose.yml`.
- **CI**: `.github/workflows/tubedeck-project-ci.yml`.

## Local Development

1. Run PostgreSQL 16 and initialize schemas (or run `docker compose up postgres -d` to apply `docker-init`).
2. Create root `.env` based on `.env.example`.
3. Install dependencies and generate Prisma clients:

   ```bash
   cd project
   npm install
   npm run generate:all
   npm run db:migrate:all
   ```

4. Start services in separate terminals (or via a process manager):

   ```bash
   npm run dev:auth
   npm run dev:queue
   npm run dev:video
   npm run dev:analysis
   npm run dev:analytics
   npm run dev:gateway
   npm run dev:web
   ```

5. Web app: http://localhost:3000 — configure `AUTH_GOOGLE_*`, `AUTH_SECRET`, and `NEXTAUTH_URL` for Google OAuth.

The gateway identifies users via the **`X-User-Id`** (UUID) request header. The web app injects the session user ID from server actions.

## Full Docker Stack

```bash
cd project
docker compose up --build
```

Provide `OPENAI_API_KEY`, `YOUTUBE_API_KEY`, `AUTH_*`, and related variables through host environment variables or `.env`.

## Future Improvements

- Add inter-service **gRPC** and **Redis event bus** (recommended in PRD).
- Prevent `X-User-Id` spoofing with signed JWT / mTLS between Auth.js session layer and gateway.
- Add Playwright E2E tests and a Postman/Insomnia GraphQL collection.
