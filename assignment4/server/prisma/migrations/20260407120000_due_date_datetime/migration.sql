-- AlterTable: store calendar dates as TIMESTAMP(3) (was TEXT)
ALTER TABLE "tasks" ALTER COLUMN "due_date" SET DATA TYPE TIMESTAMP(3) USING ("due_date"::timestamp);
