import { randomUUID } from "crypto";
import type { Prisma, TaskPriority, TaskStatus } from "@prisma/client";
import { prisma } from "../db/client";
import type { components } from "../types/generated";

/** OpenAPI contract (JSON `dueDate` is YYYY-MM-DD string) */
type ApiTask = components["schemas"]["Task"];
type TaskCreate = components["schemas"]["TaskCreate"];
type TaskUpdate = components["schemas"]["TaskUpdate"];
type TaskStats = components["schemas"]["TaskStats"];

/** Row shape from Prisma (`dueDate` may be inferred as Date or serialized string depending on IDE / client version) */
type TaskRow = {
  id: string;
  title: string;
  assignee: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimateHours: number;
  dueDate: Date | string;
};

/** OpenAPI `format: date` (YYYY-MM-DD) → UTC noon for stable calendar-day storage */
function dueDateFromApi(isoDate: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0, 0));
}

function dueDateToApi(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function toDueDate(value: Date | string): Date {
  if (value instanceof Date) return value;
  return new Date(value.includes("T") ? value : `${value}T12:00:00.000Z`);
}

function mapRow(t: TaskRow): ApiTask {
  return {
    id: t.id,
    title: t.title,
    assignee: t.assignee,
    status: t.status as ApiTask["status"],
    priority: t.priority as ApiTask["priority"],
    estimateHours: t.estimateHours,
    dueDate: dueDateToApi(toDueDate(t.dueDate)),
  };
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isOverdue(dueDate: Date, status: ApiTask["status"]): boolean {
  if (status === "DONE") return false;
  const due = startOfDay(dueDate);
  const today = startOfDay(new Date());
  return due < today;
}

export async function findAll(): Promise<ApiTask[]> {
  const rows = await prisma.task.findMany({ orderBy: { id: "asc" } });
  return rows.map((row) => mapRow(row as TaskRow));
}

export async function findById(id: string): Promise<ApiTask | undefined> {
  const row = await prisma.task.findUnique({ where: { id } });
  return row ? mapRow(row as TaskRow) : undefined;
}

export async function create(body: TaskCreate): Promise<ApiTask> {
  const id = `task-${randomUUID()}`;
  const data = {
    id,
    title: body.title,
    assignee: body.assignee,
    status: body.status as TaskStatus,
    priority: body.priority as TaskPriority,
    estimateHours: body.estimateHours,
    dueDate: dueDateFromApi(body.dueDate),
  } as unknown as Prisma.TaskUncheckedCreateInput;
  const row = await prisma.task.create({ data });
  return mapRow(row as TaskRow);
}

export async function update(id: string, patch: TaskUpdate): Promise<ApiTask | undefined> {
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) return undefined;

  const data = {
    ...(patch.title !== undefined ? { title: patch.title } : {}),
    ...(patch.assignee !== undefined ? { assignee: patch.assignee } : {}),
    ...(patch.status !== undefined ? { status: patch.status as TaskStatus } : {}),
    ...(patch.priority !== undefined ? { priority: patch.priority as TaskPriority } : {}),
    ...(patch.estimateHours !== undefined ? { estimateHours: patch.estimateHours } : {}),
    ...(patch.dueDate !== undefined ? { dueDate: dueDateFromApi(patch.dueDate) } : {}),
  } as unknown as Prisma.TaskUncheckedUpdateInput;

  const row = await prisma.task.update({
    where: { id },
    data,
  });
  return mapRow(row as TaskRow);
}

export async function remove(id: string): Promise<boolean> {
  const r = await prisma.task.deleteMany({ where: { id } });
  return r.count > 0;
}

export async function getStats(): Promise<TaskStats> {
  const tasks = await prisma.task.findMany();
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const overdueTasks = tasks
    .map((t) => t as TaskRow)
    .filter((t) => isOverdue(toDueDate(t.dueDate), t.status as ApiTask["status"])).length;
  const sumHours = tasks.reduce((s, t) => s + t.estimateHours, 0);
  const averageEstimateHours = totalTasks === 0 ? 0 : sumHours / totalTasks;
  const tasksByStatus = {
    TODO: tasks.filter((t) => t.status === "TODO").length,
    IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    DONE: tasks.filter((t) => t.status === "DONE").length,
  };
  return {
    totalTasks,
    completedTasks,
    overdueTasks,
    averageEstimateHours,
    tasksByStatus,
  };
}
