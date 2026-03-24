import type { Context } from "openapi-backend";
import type { Request, Response } from "express";
import type { components } from "../types/generated";
import * as store from "../store/tasks";

type DeleteResponse = components["schemas"]["DeleteResponse"];
type ErrorResponse = components["schemas"]["ErrorResponse"];

export function TaskService_delete(c: Context, _req: Request, res: Response): void {
  const id = c.request.params.id as string;
  const ok = store.remove(id);
  if (!ok) {
    const err: ErrorResponse = { code: 404, message: "Task not found" };
    res.status(404).json(err);
    return;
  }
  const body: DeleteResponse = { message: "Task deleted successfully" };
  res.status(200).json(body);
}
