# Building an OpenAPI-Compliant API in TypeScript

This tutorial walks through building a fully spec-driven REST API using
`studentopenapi.yaml` (a Patient Service spec) and TypeScript.  The central
concept is **wiring `operationId`s** — connecting each named operation in the
YAML to a TypeScript handler function.

---

## What is an `operationId`?

Every `path + method` in an OpenAPI spec can have an `operationId` — a unique,
machine-readable name for that operation.

```yaml
paths:
  /:
    post:
      operationId: PatientService_create   # ← this is the operationId
```

The spec in `studentopenapi.yaml` defines **six** operationIds:

| operationId                  | Method   | Path        | Description                  |
|------------------------------|----------|-------------|------------------------------|
| `PatientService_list`        | GET      | `/`         | List all patients            |
| `PatientService_create`      | POST     | `/`         | Create a new patient         |
| `PatientService_customGet`   | GET      | `/customGet`| Custom non-CRUD operation    |
| `PatientService_get`         | GET      | `/{id}`     | Get a patient by ID          |
| `PatientService_update`      | PATCH    | `/{id}`     | Partially update a patient   |
| `PatientService_delete`      | DELETE   | `/{id}`     | Delete a patient             |

"Wiring" means registering a TypeScript function for each of these names so
that when a matching HTTP request arrives, the right code runs.

---

## Project Layout

```cmd
openapits/
├── studentopenapi.yaml          ← The OpenAPI 3.0 spec (source of truth)
├── package.json
├── tsconfig.json
└── src/
    ├── server.ts                ← Express app + openapi-backend wiring
    ├── types/
    │   └── patient.ts           ← TypeScript interfaces matching YAML schemas
    ├── store/
    │   └── patients.ts          ← In-memory data store
    └── handlers/
        ├── PatientService_list.ts
        ├── PatientService_create.ts
        ├── PatientService_get.ts
        ├── PatientService_update.ts
        ├── PatientService_delete.ts
        └── PatientService_customGet.ts
```

---

## Step 1 — Project Setup

```bash
npm install
```

### Key dependencies

| Package                      | Purpose                                                     |
|------------------------------|-------------------------------------------------------------|
| `express`                    | HTTP server framework                                       |
| `openapi-backend`            | Parses the YAML spec and routes requests by operationId     |
| `swagger-ui-express`         | Serves an interactive Swagger UI from your Express app      |
| `openapi-typescript` *(dev)* | CLI tool to auto-generate TypeScript types from YAML        |
| `ts-node` *(dev)*            | Run TypeScript directly without a build step                |
| `typescript` *(dev)*         | TypeScript compiler                                         |

---

## Step 2 — Understand the YAML Schemas

Open `studentopenapi.yaml` and find `components/schemas`.  Every schema there
becomes a TypeScript interface in `src/types/patient.ts`.

### YAML → TypeScript mapping

```yaml
# studentopenapi.yaml
components:
  schemas:
    Patient:
      type: object
      required: [id, patientName, patientAge, patientGender]
      properties:
        id:           { type: string }
        patientName:  { type: string }
        patientAge:   { type: integer, format: int32 }
        patientGender:
          type: string
          enum: [Male, Female]
```

```typescript
// src/types/patient.ts
export interface Patient {
  id: string;
  patientName: string;
  patientAge: number;          // int32 maps to number in TypeScript
  patientGender: "Male" | "Female";  // enum becomes a union type
}
```

### Auto-generate types (optional but powerful)

Instead of writing the interfaces by hand you can generate them from the YAML:

```bash
npm run generate:types
# Runs: openapi-typescript studentopenapi.yaml -o src/types/generated.ts
```

Compare `src/types/generated.ts` with the hand-crafted `src/types/patient.ts`
to understand what the tool produces.

---

## Step 3 — In-Memory Data Store (`src/store/patients.ts`)

The store is a plain array with CRUD helper functions.  In production this
layer would be replaced by a database client (PostgreSQL, MongoDB, etc.) while
the handlers above it stay unchanged.

```typescript
// Simplified view
const patients: Patient[] = [ /* seed data */ ];

export function findAll(): Patient[] { ... }
export function findById(id: string): Patient | undefined { ... }
export function create(body: PatientCreate): Patient { ... }
export function update(id: string, body: PatientUpdate): Patient | undefined { ... }
export function remove(id: string): boolean { ... }
```

---

## Step 4 — Handler Functions

Each handler corresponds to **exactly one operationId**.  The signature is:

```typescript
(context: Context, req: express.Request, res: express.Response) => void
```

- `context` — provided by `openapi-backend`; contains validated params, body, etc.
- `req` / `res` — standard Express objects

### Example: `PatientService_create`

```typescript
// src/handlers/PatientService_create.ts
export function PatientService_create(c: Context, _req: Request, res: Response): void {
  // By the time this runs, openapi-backend has already validated the body
  // against components/schemas/PatientCreate.
  const body = c.request.requestBody as PatientCreate;

  const patient = store.create(body);
  res.status(201).json(patient);   // 201 = Resource created (matches the spec)
}
```

Key points:

- Use `c.request.requestBody` for the parsed, validated request body.
- Use `c.request.params` for path parameters like `{id}`.
- Return the HTTP status code described in the spec's `responses` section.

---

## Step 5 — Wiring operationIds in `server.ts`

This is the core of the tutorial.  `openapi-backend` does the heavy lifting:

```typescript
// 1. Create the backend — point it at your YAML spec
const api = new OpenAPIBackend({
  definition: path.join(__dirname, "..", "studentopenapi.yaml"),
  validate: true,   // reject requests that don't match the spec
});

// 2. Register a handler for each operationId
api.register({
  PatientService_list:      PatientService_list,
  PatientService_create:    PatientService_create,
  PatientService_get:       PatientService_get,
  PatientService_update:    PatientService_update,
  PatientService_delete:    PatientService_delete,
  PatientService_customGet: PatientService_customGet,

  // Framework handlers (not operationIds):
  validationFail: (_c, _req, res) => res.status(400).json({ code: 400, message: "Bad Request" }),
  notFound:       (_c, _req, res) => res.status(404).json({ code: 404, message: "Not Found" }),
});

// 3. Initialise (parses + validates the YAML)
api.init();

// 4. Expose the API definition — BEFORE the catch-all
//    (these paths are not in the spec, so the catch-all would 404 them)

// Raw YAML — importable by Postman, Swagger Editor, etc.
app.get("/openapi.yaml", (_req, res) => {
  res.setHeader("Content-Type", "text/yaml");
  res.send(fs.readFileSync(specPath, "utf-8"));
});

// Parsed JSON — api.document already in memory
app.get("/openapi.json", (_req, res) => {
  res.json(api.document);
});

// Swagger UI — points at /openapi.yaml so it reads the raw file.
// Using the URL option (not api.document directly) preserves the
// `openapi: 3.0.0` version field that Swagger UI requires.
app.use("/docs", swaggerUi.serve, swaggerUi.setup(undefined, {
  swaggerOptions: { url: "/openapi.yaml" },
}));

// 5. Mount as an Express catch-all
app.use((req, res) => api.handleRequest(req as any, req, res));
```

**Why register spec endpoints before the catch-all?**
`openapi-backend` handles every request that reaches `app.use(...)`.
Because `/openapi.yaml`, `/openapi.json`, and `/docs` are not defined
in the YAML spec, the backend would return 404 for them.  Registering
them as plain Express routes first means Express matches them and
returns before the catch-all is reached.

**Why `swaggerOptions: { url }` instead of passing `api.document`?**
`api.document` is a dereferenced internal object that may be missing
the top-level `openapi: 3.0.0` field Swagger UI requires.  Pointing
Swagger UI at the `/openapi.yaml` URL means it fetches the raw,
unmodified file and always finds a valid version field.

### What `validate: true` gives you for free

When a request arrives, `openapi-backend` automatically checks:

- Does the path exist in the spec?
- Does the HTTP method match?
- Are all required body fields present and the correct type?
- Do path parameters match the declared schema?

If any check fails, `validationFail` is called instead of your handler —
no validation code needed in your business logic.

---

## Step 6 — Run the Server

```bash
# Development (no build step needed)
npm run dev

# Or build first, then run
npm run build
npm start
```

You should see:

```cmd
Patient Service running on http://localhost:3000
Spec loaded: studentopenapi.yaml

Registered operationIds:
  GET    /            → PatientService_list
  POST   /            → PatientService_create
  GET    /customGet   → PatientService_customGet
  GET    /{id}        → PatientService_get
  PATCH  /{id}        → PatientService_update
  DELETE /{id}        → PatientService_delete
```

---

## Step 7 — Test the API

Open a second terminal and run these `curl` commands:

### List all patients

```bash
curl http://localhost:3000/
```

### Create a patient

```bash
curl -X POST http://localhost:3000/ \
  -H "Content-Type: application/json" \
  -d '{"patientName":"Carol White","patientAge":29,"patientGender":"Female"}'
```

### Get a specific patient (replace `{id}` with a real ID from the list)

```bash
curl http://localhost:3000/{id}
```

### Update a patient (PATCH — only send the fields you want to change)

```bash
curl -X PATCH http://localhost:3000/{id} \
  -H "Content-Type: application/json" \
  -d '{"patientAge":30}'
```

### Delete a patient

```bash
curl -X DELETE http://localhost:3000/{id}
```

### Custom operation

```bash
curl http://localhost:3000/customGet
```

### Test validation (send an invalid body — missing required field)

```bash
curl -X POST http://localhost:3000/ \
  -H "Content-Type: application/json" \
  -d '{"patientName":"Invalid"}'
# → 400 Bad Request (caught by openapi-backend before reaching your handler)
```

---

## Key Concepts Summary

| Concept | Where |
| --------- | ------- |
| `operationId` defined | `studentopenapi.yaml` — each `path + method` |
| TypeScript types | `src/types/patient.ts` — mirrors `components/schemas` |
| Business logic | `src/store/patients.ts` |
| One handler per operationId | `src/handlers/*.ts` |
| Wiring (registration) | `src/server.ts` — `api.register({...})` |
| Request validation | Automatic via `validate: true` in `openapi-backend` |

The **spec is the single source of truth**.  Routes, request shapes, and
response shapes are all defined in the YAML; your TypeScript code simply
implements the contract.
