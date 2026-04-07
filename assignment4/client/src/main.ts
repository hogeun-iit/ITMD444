import "./style.css";
import {
  Configuration,
  StatisticsApi,
  TasksApi,
} from "../../generated-client";
import {
  TaskCreatePriorityEnum,
  TaskCreateStatusEnum,
} from "../../generated-client/models/TaskCreate";

function getBaseUrl(): string {
  const url = import.meta.env.VITE_API_BASE_URL;
  if (!url || url.trim() === "") {
    throw new Error("Set VITE_API_BASE_URL (see .env.example)");
  }
  return url.replace(/\/+$/, "");
}

const config = new Configuration({ basePath: getBaseUrl() });
const tasksApi = new TasksApi(config);
const statisticsApi = new StatisticsApi(config);

const out = document.querySelector<HTMLPreElement>("#output")!;

function show(data: unknown): void {
  out.textContent = JSON.stringify(data, null, 2);
}

document.querySelector("#btn-list")!.addEventListener("click", async () => {
  const tasks = await tasksApi.taskServiceList();
  show(tasks);
});

document.querySelector("#btn-stats")!.addEventListener("click", async () => {
  const stats = await statisticsApi.taskServiceStats();
  show(stats);
});

document.querySelector("#btn-create")!.addEventListener("click", async () => {
  const taskCreate = {
    title: "Demo from generated client",
    assignee: "SDK User",
    status: TaskCreateStatusEnum.Todo,
    priority: TaskCreatePriorityEnum.Medium,
    estimateHours: 2,
    dueDate: new Date("2026-12-31T12:00:00Z"),
  };
  const created = await tasksApi.taskServiceCreate({ taskCreate });
  show(created);
});

document.querySelector("#btn-delete")!.addEventListener("click", async () => {
  const id = (document.querySelector<HTMLInputElement>("#delete-id")!).value.trim();
  if (!id) {
    show({ error: "Enter a task id" });
    return;
  }
  const result = await tasksApi.taskServiceDelete({ id });
  show(result);
});
