# Assignment 5 ? Phase 3 (TubeDeck REST + GraphQL)

Phase 3 extends the Phase 2 backend in **`assignment5/phase3`** by adding an Apollo GraphQL endpoint and reusing the same service layer and PostgreSQL schema.

## Stack

- Node.js 18+, TypeScript, Fastify 5
- REST routes from Phase 2 + GraphQL at **`/graphql`** (Apollo Server)
- Prisma + PostgreSQL (`DATABASE_URL`, `DIRECT_URL`)
- Session cookie auth (`@fastify/session`)
- YouTube Data API + transcript + optional OpenAI digest from Phase 2
- GraphQL optimization: cursor pagination/filter/sort + DataLoader

## Endpoints

- REST docs: `/docs`
- GraphQL: `/graphql`

## GraphQL Coverage (Phase 3)

### Queries

- `viewer`
- `userVideos(input)` ? cursor pagination (`first`, `after`), `includeArchived`, `sort`
- `video(videoId)`
- `pipelineStatus(videoId)`
- `recommendations(userId, limit)`

### Mutations

- `saveVideo(input)`
- `updateVideo(videoId, input)`
- `deleteVideo(videoId)`
- `reviewVideo(videoId, action)` (`VIEWED`, `SKIP`, `PIN`, `FAVORITE`, `ARCHIVE`)

## Example GraphQL

```graphql
query Viewer {
  viewer {
    id
    email
    fullName
  }
}
```

```graphql
query UserVideos($input: UserVideosInput!) {
  userVideos(input: $input) {
    hasNextPage
    nextCursor
    items {
      id
      title
      transcriptStatus
      deck {
        id
        name
      }
      user {
        id
        email
      }
    }
  }
}
```

Variables:

```json
{
  "input": {
    "userId": "<user-uuid>",
    "first": 10,
    "sort": "CREATED_AT_DESC",
    "includeArchived": false
  }
}
```

## Run locally

```bash
cd assignment5/phase3
copy .env.example .env
npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

## Test

```bash
npm run lint
npm run build
npm test
```

Includes `test/graphql.test.ts` for login + `viewer` query.
