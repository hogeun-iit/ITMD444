# Task Tracker API (ITMD 444 Assignment 3)

Contract-first REST API: OpenAPI 3.1 spec in `openapi/openapi.yaml`, implementation in TypeScript (Express).

## Deployed (production)

- **Base URL:** https://itmd444-task.onrender.com
- **Swagger UI:** https://itmd444-task.onrender.com/docs
- OpenAPI: `GET /openapi.yaml`, `GET /openapi.json`

> Render 무료 플랜은 비활성 시 콜드 스타트로 첫 응답이 지연될 수 있습니다.

## Run locally

저장소 루트가 `ITMD444`이면 **`assignment3` 폴더로 이동**한 뒤 실행합니다.

```bash
cd assignment3
npm install
npm run dev
```

- API: http://localhost:3000 (또는 환경 변수 `PORT`)
- Swagger UI: http://localhost:3000/docs

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Run with `ts-node` |
| `npm run build` | Runs `prebuild` → `generate:types`, then `tsc` → `dist/` |
| `npm start` | Run compiled `dist/server.js` |
| `npm run generate:types` | Regenerate `src/types/generated.ts` from the YAML |

## Validation

- **Request validation** uses [`openapi-backend`](https://github.com/openapistack/openapi-backend) built-in Ajv (`validate: true`). Failures are handled by the registered `validationFail` handler (HTTP 400, `ErrorResponse`-shaped body).
- **`quick: true`** skips strict OpenAPI document validation so the OAS **3.1** YAML loads; routing and request validation still use the dereferenced spec.

## Project layout

- `openapi/openapi.yaml` — single source of truth for the contract
- `src/server.ts` — Express app, validator, Swagger UI, spec routes
- `src/handlers/` — one module per `operationId`
- `src/store/tasks.ts` — in-memory data + seed rows
- `src/types/generated.ts` — generated from the YAML (`npm run generate:types`)
- `tutorial.md` — course tutorial (Patient Service example); this app uses the **Task** domain instead

## Render deployment (reference)

- **Root Directory:** `assignment3`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
