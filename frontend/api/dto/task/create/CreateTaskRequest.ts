import { Priority, TaskStatus } from "@/api/types/task.types";
import CreateTaskExecutor from "./CreateTaskExecutor";
import TagOut from "./TagOut";

export interface CreateTaskRequest {
    project_id?: number | null;

    title: string; // min_length=1, max_length=200
    description?: string | null;

    status?: TaskStatus;   // default: Status.BACKLOG
    priority?: Priority; // default: Priority.MEDIUM

    due_date?: string | null; // ISO datetime

    estimated_budget?: string | null; // Decimal, >= 0
    actual_budget?: string | null;    // Decimal, >= 0
    estimated_hours?: string | null;  // Decimal, >= 0
    actual_hours?: string | null;     // Decimal, >= 0

    note?: Record<string, unknown> | null;
    task_images?: string[] | null;
    tags?: TagOut[] | null;
    executors?: CreateTaskExecutor[] | null;
}
