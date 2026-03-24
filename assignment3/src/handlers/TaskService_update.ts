import type { Context } from "openapi-backend";
import type { Request, Response } from "express";
import type { components } from "../types/generated";
import * as store from "../store/tasks";

type TaskUpdate = components["schemas"]["TaskUpdate"];
type ErrorResponse = components["schemas"]["ErrorResponse"];

export function TaskService_update(c: Context, _req: Request, res: Response): void {
  const id = c.request.params.id as string;
  const body = c.request.requestBody as TaskUpdate;
  const task = store.update(id, body);
  if (!task) {
    const err: ErrorResponse = { code: 404, message: "Task not found" };
    res.status(404).json(err);
    return;
  }
  res.status(200).json(task);
}
