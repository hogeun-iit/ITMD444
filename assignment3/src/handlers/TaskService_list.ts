import type { Context } from "openapi-backend";
import type { Request, Response } from "express";
import * as store from "../store/tasks";

export function TaskService_list(_c: Context, _req: Request, res: Response): void {
  res.status(200).json(store.findAll());
}
