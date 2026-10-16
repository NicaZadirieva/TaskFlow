import { Priority, TaskStatus } from "@/api/types/task.types";
import { ExecutorShortOut } from "./ExecutorShortOut";
import TagShortOut from "./TagShortOut";

// Если Decimal приходит как строка — типичный вариант для Pydantic v2 JSON.
type DecimalString = string;

// datetime в JSON обычно приходит ISO-строкой.
type ISODateTimeString = string;




export interface TaskOut {
    id: number;
    tenant_id: number;
    project_id?: number | null;

    title: string;
    description?: string | null;

    status: TaskStatus;
    priority: Priority;

    due_date?: ISODateTimeString | null;
    created_at: ISODateTimeString;
    created_by: number;

    estimated_budget?: DecimalString | null;
    actual_budget?: DecimalString | null;
    estimated_hours?: DecimalString | null;
    actual_hours?: DecimalString | null;

    note?: Record<string, unknown> | null;
    task_images?: string[] | null;

    tags: TagShortOut[];
    executors: ExecutorShortOut[];
}