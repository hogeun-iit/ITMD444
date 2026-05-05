# PRD — TubeDeck

**Version:** 1.2
**Document Type:** Product Requirements Document / Engineering Build Spec
**Target Audience:** Engineering Team, Cursor AI
**Product Category:** Intelligent YouTube Knowledge Resurfacing Platform

---

# Executive Summary

TubeDeck is a personal learning system built around a simple observation:

> People save valuable YouTube videos, but rarely revisit them.

Users constantly discover useful videos:

* software engineering tutorials
* system design lectures
* startup talks
* AI explainers
* technical conference sessions
* career advice content
* educational documentaries

Most of them end up in:

* YouTube Watch Later
* browser bookmarks
* Notion pages
* self-messages
* screenshots
* scattered notes

Saved content becomes dead storage.

TubeDeck converts saved videos into **reviewable learning assets**.

Engineering mandate: the platform is implemented as **microservices**—deployable services with clear boundaries (gateway, auth, video, analysis, queue, analytics), interoperating via defined contracts and optional events—not as a single monolithic backend.

The product enables users to:

* save YouTube videos into categorized Decks
* automatically fetch metadata via YouTube Data API
* collect transcript / captions when available
* generate structured AI summaries via **OpenAI** (API)
* extract key takeaways and review questions
* organize content into a queue-based review system
* continuously resurface previously saved videos

Core product principle:

> Save intentionally
> Learn repeatedly
> Remember longer

---

# Technology Stack

Single source of truth for implementation. Unless a section below explicitly overrides, these choices apply repo-wide.

| Layer | Technology | Notes |
|-------|------------|--------|
| **Language** | TypeScript (strict) | End-to-end typing; shared types/packages for public GraphQL + internal contracts where useful |
| **Runtime** | Node.js (v22.17.0) | All microservices and the GraphQL gateway/BFF |
| **Client app** | Next.js (App Router), React | SPA-style product UI; prefer **Server Components** by default per implementation guidelines |
| **Public API** | GraphQL, **GraphQL Yoga** | Single entry: `/api/graphql` on the API Gateway (BFF) |
| **Authentication** | **Auth.js**, Google OAuth | Sessions and user-scoped isolation; enforced at gateway and within services |
| **Database** | **PostgreSQL** via **Supabase** | Hosted Postgres; schemas/ownership **per microservice** (no cross-service direct table access) |
| **ORM** | **Prisma** | Per-service Prisma schemas or packages; migrations aligned to service boundaries |
| **AI / LLM** | **OpenAI API** | Video digest pipeline (summary, takeaways, tags, difficulty, review questions); use official SDK; secrets via env / Supabase/Vault pattern—never commit keys |
| **YouTube & metadata** | **YouTube Data API v3** | Metadata, thumbnails, channel info; quota-aware usage |
| **Transcripts** | YouTube captions (official / auto-generated) | If unavailable: metadata-only mode or documented fallback provider (implementer choice, not part of core stack table) |
| **Inter-service RPC** | **gRPC** (preferred) | `.proto` contracts, versioned packages; **REST** acceptable only where gRPC is impractical—document exceptions |
| **Async / optional broker** | **Redis** | Pub/sub or lightweight coordination between services where needed |
| **Validation** | **Zod** | All external inputs (GraphQL variables, webhooks, internal HTTP boundaries) |
| **Logging** | **Pino** | Structured logs; correlation IDs across gateway → services |
| **Testing** | **Vitest**, **Playwright** | Unit/integration/resolver tests; E2E against running stack |
| **Containerization** | **Docker** | One image per microservice (+ client/gateway as applicable); local **Docker Compose** for full stack dev |
| **CI/CD** | **GitHub Actions** | Lint, test, build, deploy per service (matrix or workflows) |
| **Hosting (typical)** | **Vercel** for **Next.js client** and optionally the **GraphQL gateway** (serverless/Node); **domain microservices** on container platform or VMs—must stay **independently deployable** |

**Out of scope for this table:** cloud vendor for microservices (AWS/GCP/Azure), orchestrator (ECS/K8s), and exact transcript fallback library—pick at implementation time and document in the README.

---

# Problem Statement

Modern learners suffer from knowledge decay.

Pain points:

valuable videos are saved but forgotten

saved content is unstructured

revisiting requires deliberate effort

users do not know what to review next

long-form video content is difficult to summarize

there is no reinforcement loop

Existing products optimize for discovery.

TubeDeck optimizes for retention.

---

# Product Goals

Increase revisit rate of saved educational videos

Turn passive bookmarking into active review

Reduce friction in organizing learning resources

Automatically summarize long-form video content

Create reusable knowledge notes from video transcripts

Build habit-forming queue-based resurfacing

Provide production-grade full-stack architecture

Deliver the backend as a **microservices architecture**: independently deployable services, explicit bounded contexts, and defined inter-service contracts (not a modular monolith unless individual services remain separately buildable and deployable).

---

# Non-goals

TubeDeck is not:

a social platform

a recommendation engine for discovering new YouTube videos

a raw video hosting platform

a full note-taking suite

a generic bookmark manager

---

# Core User Experience

Primary flow:

```text
Paste YouTube URL
→ Fetch Metadata
→ Fetch Transcript
→ Run AI Analysis
→ Create Structured Digest
→ Assign Deck
→ Insert Into Review Queue
→ Surface Later
→ Review
→ Rotate Queue
```

Expected experience:

> "Every time I open TubeDeck, one useful video I once saved comes back to me with a concise digest."

---

# Product Features

## Authentication

Authentication uses Auth.js

Provider:

Google OAuth

Capabilities:

sign in

sign out

session persistence

protected routes

user-scoped data isolation

---

## Deck Management

Decks are learning buckets.

Examples:

Backend

AI

Career

Startup

English

Motivation

Each Deck supports:

name

description

icon

color

default review cadence

sorting order

queue mode

CRUD operations required

---

## Video Saving

User pastes:

```text
https://www.youtube.com/watch?v=...
```

System validates URL.

System extracts:

videoId

title

description

channelTitle

thumbnail

duration

publishedAt

viewCount

likeCount

category

tags

Data source:

YouTube Data API

---

## Transcript Collection

System attempts transcript retrieval.

Sources:

official captions

auto-generated captions

fallback transcript provider

If unavailable:

metadata-only mode

Status:

TRANSCRIPT_READY

METADATA_ONLY

FAILED

---

## AI Video Digest

Core differentiator.

Transcript is processed through **OpenAI** (API)—structured outputs for digest fields below.

Generated fields:

summary

keyTakeaways

suggestedTags

difficulty

recommendedDeck

reviewQuestions

estimatedLearningValue

Output example:

Summary

A concise 3–5 sentence overview

Key Takeaways

3–7 bullet points

Suggested Tags

GraphQL

Backend

Prisma

System Design

Difficulty

BEGINNER / INTERMEDIATE / ADVANCED

Review Questions

3 reflective prompts

---

## Notes

User may add:

personal memo

implementation ideas

why saved

follow-up actions

Example:

```text
Apply this Redis queue pattern to next project
```

---

## Queue Engine

Every Deck owns a queue.

FIFO rotation model:

Before:

```text
1 → 2 → 3 → 4
```

Viewed:

```text
2 → 3 → 4 → 1
```

Actions:

Viewed

Skip

Pin

Favorite

Archive

Behavior:

Viewed → move tail

Skip → middle insertion

Pin → move front

Favorite → weighted boost

Archive → remove

---

## Dashboard

Shows:

Today's review video

Deck overview

Recently reviewed

Review streak

Most watched channels

Knowledge stats

---

## Search

Search by:

title

channel

tag

deck

difficulty

review status

---

# Domain Model

Core entities:

User

Deck

Video

VideoAnalysis

Tag

VideoTag

ReviewLog

QueueState

Relationships:

User 1:N Deck

Deck 1:N Video

Video 1:1 VideoAnalysis

Video N:M Tag

Video 1:N ReviewLog

---

# System Architecture

Architecture pattern (non-negotiable):

**Microservices**

TubeDeck’s backend MUST be implemented as **microservices**: each core capability runs as its **own deployable service** with a **bounded context**, **owned data**, and **explicit APIs** for calls from other services or from the gateway. This satisfies course and final-project requirements that mandate **microservices architecture** (as opposed to serverless-only or a single deployable monolith).

## Service map

| Service | Responsibility |
|--------|------------------|
| **API Gateway (BFF)** | Single GraphQL endpoint (`/api/graphql`) for clients; aggregates calls to downstream services; auth/session propagation; stable public contract |
| **Auth Service** | Google OAuth (Auth.js integration surface), sessions/tokens, user identity; user-scoped authorization decisions |
| **Video Service** | YouTube URL validation, YouTube Data API integration, metadata persistence, transcript orchestration (captions / fallback providers), video CRUD |
| **Analysis Service** | **OpenAI**-based digest pipeline (summary, takeaways, tags, difficulty, review questions); consumes transcript/events from Video flow |
| **Queue Service** | Deck queues, rotation (FIFO / skip / pin / favorite / archive), queue state machine |
| **Analytics Service** | Dashboard aggregates, streaks, channel stats, knowledge metrics (read-heavy; may subscribe to events) |

Services MUST remain **loosely coupled**: domain logic stays inside the owning service; the gateway does not embed business rules beyond orchestration and mapping.

## Inter-service communication

- **Synchronous**: service-to-service calls over **well-defined contracts** (e.g. REST or **gRPC** between services); timeouts, retries, and structured errors are required at boundaries.
- **Asynchronous (optional but recommended)**: **domain events** for long-running or fan-out work (e.g. video saved → enqueue analysis; analysis complete → notify queue/analytics).
- **Optional broker**: **Redis pub/sub** (or equivalent) for lightweight event fan-out where appropriate.

## Data ownership

- Each service **owns its tables/schemas** (logical or physical separation). Shared PostgreSQL (e.g. Supabase) MAY host multiple services using **separate schemas or databases** as long as **ownership and foreign-key boundaries** are documented; no service may query another service’s tables directly—only via that service’s API or agreed events.

## Deployment shape

- Each service is **independently containerizable** (Docker) and **independently deployable** in CI/CD (e.g. GitHub Actions).
- The **web/GraphQL edge** may be hosted on a platform such as Vercel **only if** it is clearly the **gateway/BFF layer** calling **separately deployed** backend services—not a single monolithic API binary.

---

# API Contract

Protocol:

GraphQL

Framework:

GraphQL Yoga

Endpoint:

```text
/api/graphql
```

Core Queries:

viewer

decks

deck

videos

video

dashboard

analytics

Core Mutations:

createDeck

updateDeck

deleteDeck

saveVideo

analyzeVideo

reviewVideo

archiveVideo

favoriteVideo

---

# Database

Provider:

Supabase

Engine:

PostgreSQL

Ownership:

Tables and schemas are **owned by a single microservice** each; cross-service consistency uses APIs and events—not direct cross-schema queries from foreign services (see **System Architecture → Data ownership**).

ORM:

Prisma (typically per service repo or per-service package; schema boundaries align with service boundaries)

Constraints:

foreign keys

unique indexes

enum validation

transactional updates

soft delete support

audit timestamps

---

# Observability

Logging:

request logs

resolver logs

analysis logs

queue transition logs

error logs

audit logs

Library:

Pino

---

# Testing

Unit tests

integration tests

GraphQL resolver tests

database repository tests

queue logic tests

E2E tests

Tools:

Vitest

Playwright

---

# Deployment

Frontend (SPA):

Vercel (or equivalent static/SSR host for the Next.js/React client)

API Gateway (GraphQL BFF):

Deploy separately from domain microservices (e.g. Vercel serverless/Node or containerized gateway—the PRD requires that **domain services** are not collapsed into one undeployable blob)

Microservices (Auth, Video, Analysis, Queue, Analytics):

Docker images per service; orchestration MAY be Compose locally and cloud VMs / container platform for production—each service must remain **independently deployable**

Database:

Supabase (PostgreSQL); schemas or DB boundaries per owning service as documented in System Architecture

Containerization:

Docker (one image per microservice plus gateway/client as applicable)

CI/CD:

GitHub Actions (build, test, deploy **per service** or matrix builds; artifact promotion)

---

# Cursor AI Implementation Guidelines

Use strict TypeScript

Use schema-first GraphQL

Use Prisma-first data modeling

Implement **microservice** boundaries clearly (one deployable per service; no cross-service DB access)

Separate domain/service/repository layers **within** each service

Define **inter-service contracts** (OpenAPI/gRPC/proto or shared types) at stable versioned boundaries

Validate all input with Zod

Centralize error handling

Prefer Server Components by default

Use Client Components only when interactive state is required

Keep codebase modular and testable

Optimize for clean architecture over rapid hacks
