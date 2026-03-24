import { randomUUID } from "crypto";
import type { components } from "../types/generated";

type Task = components["schemas"]["Task"];
type TaskCreate = components["schemas"]["TaskCreate"];
type TaskUpdate = components["schemas"]["TaskUpdate"];
type TaskStats = components["schemas"]["TaskStats"];

function makeTask(data: Omit<Task, "id">): Task {
  return { id: `task-${randomUUID()}`, ...data };
}

const tasks: Task[] = [
  makeTask({
    title: "Review OpenAPI spec",
    assignee: "Alice Kim",
    status: "DONE",
    priority: "HIGH",
    estimateHours: 4,
    dueDate: "2026-03-01",
  }),
  makeTask({
    title: "Implement Task API",
    assignee: "Bob Lee",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    estimateHours: 8,
    dueDate: "2026-12-31",
  }),
  makeTask({
    title: "Write integration tests",
    assignee: "Charlie Park",
    status: "TODO",
    priority: "HIGH",
    estimateHours: 6,
    dueDate: "2026-06-15",
  }),
  makeTask({
    title: "Deploy to cloud",
    assignee: "Dana Singh",
    status: "TODO",
    priority: "LOW",
    estimateHours: 3,
    dueDate: "2026-05-01",
  }),
  makeTask({
    title: "Update Swagger examples",
    assignee: "Eve Chen",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    estimateHours: 2,
    dueDate: "2026-04-20",
  }),
];

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isOverdue(dueDate: string, status: Task["status"]): boolean {
  if (status === "DONE") return false;
  const due = startOfDay(new Date(dueDate + "T12:00:00"));
  const today = startOfDay(new Date());
  return due < today;
}

export function findAll(): Task[] {
  return [...tasks];
}

export function findById(id: string): Task | undefined {
  return tasks.find((t) => t.id === id);
}

export function create(body: TaskCreate): Task {
  const task: Task = {
    id: `task-${randomUUID()}`,
    title: body.title,
    assignee: body.assignee,
    status: body.status,
    priority: body.priority,
    estimateHours: body.estimateHours,
    dueDate: body.dueDate,
  };
  tasks.push(task);
  return task;
}

export function update(id: string, patch: TaskUpdate): Task | undefined {
  const i = tasks.findIndex((t) => t.id === id);
  if (i === -1) return undefined;
  const merged: Task = { ...tasks[i], ...patch, id: tasks[i].id };
  tasks[i] = merged;
  return merged;
}

export function remove(id: string): boolean {
  const i = tasks.findIndex((t) => t.id === id);
  if (i === -1) return false;
  tasks.splice(i, 1);
  return true;
}

export function getStats(): TaskStats {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const overdueTasks = tasks.filter((t) => isOverdue(t.dueDate, t.status)).length;
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
