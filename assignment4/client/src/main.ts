import "./style.css";
import {
  Configuration,
  ResponseError,
  StatisticsApi,
  TasksApi,
} from "../../generated-client";
import type { Task } from "../../generated-client/models/Task";
import type { TaskStats } from "../../generated-client/models/TaskStats";
import {
  TaskCreatePriorityEnum,
  TaskCreateStatusEnum,
} from "../../generated-client/models/TaskCreate";
import {
  TaskUpdatePriorityEnum,
  TaskUpdateStatusEnum,
} from "../../generated-client/models/TaskUpdate";

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

const statusEl = document.querySelector<HTMLDivElement>("#status-msg")!;
const tasksTbody = document.querySelector<HTMLTableSectionElement>("#tasks-tbody")!;
const tasksEmpty = document.querySelector<HTMLParagraphElement>("#tasks-empty")!;
const detailPanel = document.querySelector<HTMLElement>("#detail-panel")!;
const formCreate = document.querySelector<HTMLFormElement>("#form-create")!;
const formEdit = document.querySelector<HTMLFormElement>("#form-edit")!;

let selectedTaskId: string | null = null;

function setStatus(text: string, kind: "ok" | "error" | "neutral" = "neutral"): void {
  statusEl.textContent = text;
  statusEl.classList.remove("ok", "error");
  if (kind === "ok") statusEl.classList.add("ok");
  if (kind === "error") statusEl.classList.add("error");
}

async function formatApiError(err: unknown): Promise<string> {
  if (err instanceof ResponseError) {
    try {
      const body = await err.response.clone().json();
      if (body && typeof body.message === "string") {
        return `${err.response.status}: ${body.message}`;
      }
    } catch {
      /* ignore */
    }
    return `${err.response.status} ${err.response.statusText}`;
  }
  return err instanceof Error ? err.message : String(err);
}

function statusToCreateEnum(v: string): TaskCreateStatusEnum {
  switch (v) {
    case "IN_PROGRESS":
      return TaskCreateStatusEnum.InProgress;
    case "DONE":
      return TaskCreateStatusEnum.Done;
    default:
      return TaskCreateStatusEnum.Todo;
  }
}

function priorityToCreateEnum(v: string): TaskCreatePriorityEnum {
  switch (v) {
    case "LOW":
      return TaskCreatePriorityEnum.Low;
    case "HIGH":
      return TaskCreatePriorityEnum.High;
    default:
      return TaskCreatePriorityEnum.Medium;
  }
}

function statusToUpdateEnum(v: string): TaskUpdateStatusEnum {
  switch (v) {
    case "IN_PROGRESS":
      return TaskUpdateStatusEnum.InProgress;
    case "DONE":
      return TaskUpdateStatusEnum.Done;
    default:
      return TaskUpdateStatusEnum.Todo;
  }
}

function priorityToUpdateEnum(v: string): TaskUpdatePriorityEnum {
  switch (v) {
    case "LOW":
      return TaskUpdatePriorityEnum.Low;
    case "HIGH":
      return TaskUpdatePriorityEnum.High;
    default:
      return TaskUpdatePriorityEnum.Medium;
  }
}

function renderStats(stats: TaskStats): void {
  document.querySelector("#stat-total")!.textContent = String(stats.totalTasks);
  document.querySelector("#stat-done")!.textContent = String(stats.completedTasks);
  document.querySelector("#stat-overdue")!.textContent = String(stats.overdueTasks);
  document.querySelector("#stat-avg")!.textContent = stats.averageEstimateHours.toFixed(2);
  const by = stats.tasksByStatus;
  document.querySelector("#stat-by-status")!.textContent = `${by.tODO} / ${by.iNPROGRESS} / ${by.dONE}`;
}

function clearStatsDisplay(): void {
  document.querySelector("#stat-total")!.textContent = "—";
  document.querySelector("#stat-done")!.textContent = "—";
  document.querySelector("#stat-overdue")!.textContent = "—";
  document.querySelector("#stat-avg")!.textContent = "—";
  document.querySelector("#stat-by-status")!.textContent = "—";
}

function dueInputValue(task: Task): string {
  return task.dueDate.toISOString().slice(0, 10);
}

/** Accepts YYYY-MM-DD only; avoids locale-specific date pickers. */
function parseDueDateInput(s: string): Date | null {
  const t = s.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  const d = new Date(`${t}T12:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function fillEditForm(task: Task): void {
  const f = formEdit;
  (f.elements.namedItem("title") as HTMLInputElement).value = task.title;
  (f.elements.namedItem("assignee") as HTMLInputElement).value = task.assignee;
  (f.elements.namedItem("status") as HTMLSelectElement).value = task.status;
  (f.elements.namedItem("priority") as HTMLSelectElement).value = task.priority;
  (f.elements.namedItem("estimateHours") as HTMLInputElement).value = String(task.estimateHours);
  (f.elements.namedItem("dueDate") as HTMLInputElement).value = dueInputValue(task);
}

function hideDetail(): void {
  selectedTaskId = null;
  detailPanel.classList.add("hidden");
}

function showDetail(task: Task): void {
  selectedTaskId = task.id;
  fillEditForm(task);
  detailPanel.classList.remove("hidden");
  detailPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderTaskRows(tasks: Task[]): void {
  tasksTbody.replaceChildren();
  tasksEmpty.classList.toggle("hidden", tasks.length > 0);

  for (const task of tasks) {
    const tr = document.createElement("tr");

    const tdTitle = document.createElement("td");
    tdTitle.textContent = task.title;

    const tdAssignee = document.createElement("td");
    tdAssignee.textContent = task.assignee;

    const tdStatus = document.createElement("td");
    tdStatus.textContent = task.status;

    const tdPri = document.createElement("td");
    tdPri.textContent = task.priority;

    const tdDue = document.createElement("td");
    tdDue.textContent = dueInputValue(task);

    const tdHours = document.createElement("td");
    tdHours.textContent = String(task.estimateHours);

    const tdActions = document.createElement("td");
    tdActions.className = "cell-actions";

    const btnOpen = document.createElement("button");
    btnOpen.type = "button";
    btnOpen.textContent = "Open";
    btnOpen.addEventListener("click", () => {
      void (async () => {
        try {
          const fresh = await tasksApi.taskServiceGet({ id: task.id });
          showDetail(fresh);
          setStatus("", "neutral");
        } catch (e) {
          setStatus(await formatApiError(e), "error");
        }
      })();
    });

    const btnDel = document.createElement("button");
    btnDel.type = "button";
    btnDel.textContent = "Delete";
    btnDel.className = "btn-danger";
    btnDel.addEventListener("click", () => {
      if (!confirm(`Delete task "${task.title}"?`)) return;
      void (async () => {
        try {
          await tasksApi.taskServiceDelete({ id: task.id });
          if (selectedTaskId === task.id) hideDetail();
          setStatus("Task deleted.", "ok");
          await refreshList();
          await refreshStats();
        } catch (e) {
          setStatus(await formatApiError(e), "error");
        }
      })();
    });

    tdActions.append(btnOpen, btnDel);
    tr.append(tdTitle, tdAssignee, tdStatus, tdPri, tdDue, tdHours, tdActions);
    tasksTbody.append(tr);
  }
}

async function refreshList(): Promise<void> {
  try {
    const tasks = await tasksApi.taskServiceList();
    renderTaskRows(tasks);
  } catch (e) {
    setStatus(await formatApiError(e), "error");
  }
}

async function refreshStats(): Promise<void> {
  try {
    const stats = await statisticsApi.taskServiceStats();
    renderStats(stats);
  } catch (e) {
    clearStatsDisplay();
    setStatus(await formatApiError(e), "error");
  }
}

document.querySelector("#btn-refresh-list")!.addEventListener("click", () => {
  void (async () => {
    setStatus("Loading…");
    await refreshList();
    setStatus("", "neutral");
  })();
});

document.querySelector("#btn-refresh-stats")!.addEventListener("click", () => {
  void (async () => {
    setStatus("Loading…");
    await refreshStats();
    setStatus("", "neutral");
  })();
});

formCreate.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const fd = new FormData(formCreate);
  const title = String(fd.get("title") ?? "").trim();
  const assignee = String(fd.get("assignee") ?? "").trim();
  const dueStr = String(fd.get("dueDate") ?? "");
  const hours = Number(fd.get("estimateHours"));

  const dueDate = parseDueDateInput(dueStr);
  if (!title || !assignee || !dueDate || !Number.isFinite(hours) || hours < 1) {
    setStatus("Check all fields: due date must be YYYY-MM-DD.", "error");
    return;
  }

  void (async () => {
    try {
      await tasksApi.taskServiceCreate({
        taskCreate: {
          title,
          assignee,
          status: statusToCreateEnum(String(fd.get("status"))),
          priority: priorityToCreateEnum(String(fd.get("priority"))),
          estimateHours: hours,
          dueDate,
        },
      });
      formCreate.reset();
      (formCreate.elements.namedItem("estimateHours") as HTMLInputElement).value = "4";
      (formCreate.elements.namedItem("priority") as HTMLSelectElement).value = "MEDIUM";
      setStatus("Task created.", "ok");
      await refreshList();
      await refreshStats();
    } catch (e) {
      setStatus(await formatApiError(e), "error");
    }
  })();
});

formEdit.addEventListener("submit", (ev) => {
  ev.preventDefault();
  if (!selectedTaskId) return;

  const fd = new FormData(formEdit);
  const title = String(fd.get("title") ?? "").trim();
  const assignee = String(fd.get("assignee") ?? "").trim();
  const dueStr = String(fd.get("dueDate") ?? "");
  const hours = Number(fd.get("estimateHours"));

  const dueDate = parseDueDateInput(dueStr);
  if (!title || !assignee || !dueDate || !Number.isFinite(hours) || hours < 1) {
    setStatus("Check all fields: due date must be YYYY-MM-DD.", "error");
    return;
  }

  void (async () => {
    try {
      const updated = await tasksApi.taskServiceUpdate({
        id: selectedTaskId,
        taskUpdate: {
          title,
          assignee,
          status: statusToUpdateEnum(String(fd.get("status"))),
          priority: priorityToUpdateEnum(String(fd.get("priority"))),
          estimateHours: hours,
          dueDate,
        },
      });
      showDetail(updated);
      setStatus("Changes saved.", "ok");
      await refreshList();
      await refreshStats();
    } catch (e) {
      setStatus(await formatApiError(e), "error");
    }
  })();
});

document.querySelector("#btn-delete-selected")!.addEventListener("click", () => {
  if (!selectedTaskId) return;
  if (!confirm("Delete this task?")) return;
  void (async () => {
    try {
      await tasksApi.taskServiceDelete({ id: selectedTaskId });
      hideDetail();
      setStatus("Task deleted.", "ok");
      await refreshList();
      await refreshStats();
    } catch (e) {
      setStatus(await formatApiError(e), "error");
    }
  })();
});

document.querySelector("#btn-close-detail")!.addEventListener("click", () => {
  hideDetail();
  setStatus("", "neutral");
});

void (async () => {
  setStatus("Loading…");
  await refreshList();
  await refreshStats();
  setStatus("", "neutral");
})();
