import type { Context } from "openapi-backend";
import type { Request, Response } from "express";
import type { components } from "../types/generated";
import * as store from "../store/tasks";

type ErrorResponse = components["schemas"]["ErrorResponse"];

export function TaskService_get(c: Context, _req: Request, res: Response): void {
  const id = c.request.params.id as string;
  const task = store.findById(id);
  if (!task) {
    const err: ErrorResponse = { code: 404, message: "Task not found" };
    res.status(404).json(err);
    return;
  }
  res.status(200).json(task);
}
