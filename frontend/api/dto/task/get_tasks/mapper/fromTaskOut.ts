import type { TaskOut } from "@/api/dto/task/get_tasks/TaskOut";
import type { Priority, Status, Task } from "@/entities/task.interface";

import { dateOrEpoch } from "@/lib/date/dateOrEpoch";
import { fromExecutorOut } from "./fromExecutorOut";
import { fromNoteOut } from "./fromNoteOut";
import { fromTagOut } from "./fromTagOut";

const num = (v: string | number | null | undefined): number =>
    v == null ? 0 : typeof v === "string" ? Number(v) || 0 : v;

const numOrUndef = (v: string | number | null | undefined): number | undefined => {
    if (v == null) return undefined;
    const n = typeof v === "string" ? Number(v) : v;
    return Number.isFinite(n) ? n : undefined;
};

export function fromTaskOut(src: TaskOut): Task {
    const plannedHours = numOrUndef(src.estimated_hours);
    const factHours = numOrUndef(src.actual_hours);
    const plannedBudget = numOrUndef(src.estimated_budget);
    const factBudget = numOrUndef(src.actual_budget);

    return {
        id: src.id,
        project_id: src.project_id ?? undefined,
        title: src.title,
        status: src.status as Status,
        description: src.description ?? undefined,

        hours: { fact: factHours, planned: plannedHours },
        budget: { fact: factBudget, planned: plannedBudget },

        due_date: dateOrEpoch(src.due_date),
        overdueDays: src.overdue_days ?? 0,

        note: src.note ? fromNoteOut(src.note) : undefined,
        assignees: (src.executors ?? []).map(fromExecutorOut),
        tags: src.tags ? src.tags.map(fromTagOut) : undefined,

        priority: src.priority as Priority,
        created_by: src.created_by,
        created_at: dateOrEpoch(src.created_at),
        task_images: src.task_images ?? undefined,
    };
}