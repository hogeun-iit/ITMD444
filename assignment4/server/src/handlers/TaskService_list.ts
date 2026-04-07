import type { Context } from "openapi-backend";
import type { Request, Response } from "express";
import * as store from "../store/tasks";

export async function TaskService_list(_c: Context, _req: Request, res: Response): Promise<void> {
  res.status(200).json(await store.findAll());
}
