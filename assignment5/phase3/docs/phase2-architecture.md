# Phase 2 — Third-party integrations (architecture)

Diagram for `backend-dev-api.md` Phase 2 deliverable.

```mermaid
flowchart TB
  subgraph Client
    Browser[Browser / API client]
  end

  subgraph API["TubeDeck REST (Fastify)"]
    Routes[Routes: auth, users, videos, pipeline, recommendations]
    Svc[Service layer: video, pipeline, recommendations]
    Cache[In-memory TTL cache — YouTube metadata]
  end

  subgraph External
    YTData[YouTube Data API v3]
    YTCaptions[youtube-transcript — public captions]
    OAI[OpenAI Chat Completions]
  end

  subgraph Data
    PG[(PostgreSQL + Prisma)]
  end

  Browser --> Routes
  Routes --> Svc
  Svc --> Cache
  Cache --> YTData
  Svc --> YTCaptions
  Svc --> OAI
  Svc --> PG
```

**Failure handling:** transcript fetch retries + fallback text (title/description) for digest; OpenAI errors recorded in `videos.pipeline_last_error`. Metadata uses cache to reduce quota/latency.

**Recommendations:** only rows in `videos` owned by the user — queue head per deck (`pinned` → `favorite_rank` → `queue_order`), no global YouTube discovery.
