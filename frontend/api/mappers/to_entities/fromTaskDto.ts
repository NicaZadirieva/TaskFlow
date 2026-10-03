import { Priority, Task as TaskDb } from '@/api/types/task.types';
import { Status } from '@/entities/task.interface';
import { fromAssignedTaskToAssignee } from './fromAssignedTaskToAssignee';
import { fromNoteDto } from './fromNoteDto';

export function fromTaskDto(src: TaskDb) {
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
        note: src.note ? fromNoteDto(src.note) : undefined,
        assignees: (src.assignees ?? []).map(fromAssignedTaskToAssignee),
        tags: src.tags,
        priority: src.priority as Priority,
        created_by: src.createdBy,
        created_at: src.createdAt,
        task_images: src.task_images,
    };
}