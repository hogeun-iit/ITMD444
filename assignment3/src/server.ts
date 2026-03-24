import express from "express";
import fs from "fs";
import path from "path";
import type { Context } from "openapi-backend";
import OpenAPIBackend from "openapi-backend";
import swaggerUi from "swagger-ui-express";
import { TaskService_list } from "./handlers/TaskService_list";
import { TaskService_create } from "./handlers/TaskService_create";
import { TaskService_stats } from "./handlers/TaskService_stats";
import { TaskService_get } from "./handlers/TaskService_get";
import { TaskService_update } from "./handlers/TaskService_update";
import { TaskService_delete } from "./handlers/TaskService_delete";

const app = express();
app.use(express.json());

const specPath = path.join(__dirname, "..", "openapi", "openapi.yaml");

// OAS 3.1: skip strict document check (quick); request validation via built-in Ajv (validate: true).
const api = new OpenAPIBackend({
  definition: specPath,
  quick: true,
  validate: true,
});

function validationFail(c: Context, _req: express.Request, res: express.Response): void {
  const errs = c.validation?.errors;
  const message =
    Array.isArray(errs) && errs.length > 0
      ? errs.map((e) => (e.message ? `${e.instancePath || "/"} ${e.message}`.trim() : String(e))).join("; ")
      : "Bad Request";
  res.status(400).json({ code: 400, message });
}

api.register({
  TaskService_list: TaskService_list,
  TaskService_create: TaskService_create,
  TaskService_stats: TaskService_stats,
  TaskService_get: TaskService_get,
  TaskService_update: TaskService_update,
  TaskService_delete: TaskService_delete,

  validationFail,
  notFound: (_c, _req, res) =>
    res.status(404).json({ code: 404, message: "Not Found" }),
});

app.get("/openapi.yaml", (_req, res) => {
  res.setHeader("Content-Type", "text/yaml");
  res.send(fs.readFileSync(specPath, "utf-8"));
});

app.get("/openapi.json", (_req, res) => {
  res.json(api.document);
});

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: { url: "/openapi.yaml" },
  })
);

app.use((req, res) => {
  void api.handleRequest(req as any, req, res);
});

const PORT = Number(process.env.PORT) || 3000;

void (async () => {
  await api.init();
  app.listen(PORT, () => {
    console.log(`Task Tracker API running on http://localhost:${PORT}`);
    console.log(`Spec: openapi/openapi.yaml`);
    console.log(`Swagger UI: http://localhost:${PORT}/docs`);
  });
})();
