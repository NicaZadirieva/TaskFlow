import { AssignedTask } from '@/api/types/assigned-task.types';

import { Priority, Task as TaskDb } from '@/api/types/task.types';

import ITaskNote from '@/api/types/note.types';
import { Assignee } from '@/entities/assignee.interface';
import { Status } from '@/entities/task.interface';

export function fromAssignedTaskToAssignee(src: AssignedTask): Assignee {
  return {
    id: src.id,
    user_id: src.userId,
    user_name: src.userName,
    task_id: src.taskId,
    tenant_id: src.tenantId,
    role_in_task: src.roleInTask,
    assigned_at: src.assignedAt,
    is_active: src.isActive,
    hours: src.actualHours,
    planned: src.estimatedHours,
    reassigned_reason: src.reassigned_reason,
    remove_reason: src.remove_reason,
    removed: src.removed,
    hourly_rate: src.hourly_rate
  };
}


export function fromTaskSchema(src: TaskDb) {
  const estimated = src.estimatedHours ?? 0;
  const actual = src.actualHours ?? 0;

  return {
    id: src.id,
    project_id: src.projectId,
    title: src.title,
    status: src.status as Status,
    description: src.description,
    hours: { fact: actual, planned: estimated },
    budget: {
      fact: src.actualBudget ?? 0,
      planned: src.estimatedBudget ?? 0,
    },
    estimate: { planned: estimated, fact: actual },
    ratio: src.ratio ?? null,
    due_date: src.dueDate ?? new Date(0),
    overdueDays: src.overdueDays ?? 0,
    note: src.note ? mapNote(src.note) : undefined,
    assignees: (src.assignees ?? []).map(fromAssignedTaskToAssignee),
    tags: src.tags,
    priority: src.priority as Priority,
    created_by: src.createdBy,
    created_at: src.createdAt,
    task_images: src.task_images,
  };
}

// ---------- Note ----------

function mapNote(src: ITaskNote) {
  return {
    kind: src.kind as 'danger' | 'info',
    label: src.label,
    text: src.text,
  };
}
