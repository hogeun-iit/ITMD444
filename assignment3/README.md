# Task Tracker API (ITMD 444 Assignment 3)

Contract-first REST API: OpenAPI 3.1 spec in `openapi/openapi.yaml`, implementation in TypeScript (Express).

## Run locally

```bash
npm install
npm run dev
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Run with `ts-node` |
| `npm run build` | Compile to `dist/` |
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
