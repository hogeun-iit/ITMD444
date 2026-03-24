import type { Context } from "openapi-backend";
import type { Request, Response } from "express";
import type { components } from "../types/generated";
import * as store from "../store/tasks";

type TaskCreate = components["schemas"]["TaskCreate"];

export function TaskService_create(c: Context, _req: Request, res: Response): void {
  const body = c.request.requestBody as TaskCreate;
  const task = store.create(body);
  res.status(201).json(task);
}
