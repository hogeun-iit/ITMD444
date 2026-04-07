import { PrismaClient, TaskPriority, TaskStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const seeds = [
    {
      id: "task-00000000-0000-4000-8000-000000000001",
      title: "Review OpenAPI spec",
      assignee: "Alice Kim",
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      estimateHours: 4,
      dueDate: new Date(Date.UTC(2026, 2, 1, 12, 0, 0, 0)),
    },
    {
      id: "task-00000000-0000-4000-8000-000000000002",
      title: "Implement Task API",
      assignee: "Bob Lee",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      estimateHours: 8,
      dueDate: new Date(Date.UTC(2026, 11, 31, 12, 0, 0, 0)),
    },
    {
      id: "task-00000000-0000-4000-8000-000000000003",
      title: "Write integration tests",
      assignee: "Charlie Park",
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      estimateHours: 6,
      dueDate: new Date(Date.UTC(2026, 5, 15, 12, 0, 0, 0)),
    },
    {
      id: "task-00000000-0000-4000-8000-000000000004",
      title: "Deploy to cloud",
      assignee: "Dana Singh",
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      estimateHours: 3,
      dueDate: new Date(Date.UTC(2026, 4, 1, 12, 0, 0, 0)),
    },
    {
      id: "task-00000000-0000-4000-8000-000000000005",
      title: "Update Swagger examples",
      assignee: "Eve Chen",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      estimateHours: 2,
      dueDate: new Date(Date.UTC(2026, 3, 20, 12, 0, 0, 0)),
    },
  ];

  for (const row of seeds) {
    await prisma.task.upsert({
      where: { id: row.id },
      create: row,
      update: row,
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
