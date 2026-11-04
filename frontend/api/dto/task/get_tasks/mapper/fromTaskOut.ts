import { Priority } from '@/api/types/task.types';
import { Status } from '@/entities/task.interface';

import { TaskOut } from '@/api/dto/task/get_tasks/TaskOut';
import { fromExecutorOut } from './fromExecutorOut';
import { fromNoteOut } from './fromNoteOut';
import toNum from '@/utils/toNum';

export function fromTaskOut(src: TaskOut) {
	return {
		id: src.id,
		project_id: src.project_id ?? undefined,
		title: src.title,
		status: src.status as Status,
		description: src.description ?? undefined,

		hours: {
			fact: toNum(src.actual_hours),
			planned: toNum(src.estimated_hours)
		},
		budget: {
			fact: toNum(src.actual_budget),
			planned: toNum(src.estimated_budget)
		},
		due_date: src.due_date ? new Date(src.due_date) : new Date(0),
		overdueDays: src.overdue_days ?? 0,
		note: src.note ? fromNoteOut(src.note) : undefined,
		assignees: (src.executors ?? []).map(fromExecutorOut),
		tags: src.tags,
		priority: src.priority as Priority,
		created_by: src.created_by,
		created_at: new Date(src.created_at),
		task_images: src.task_images ?? undefined,

		executorsHours: {
			fact: toNum(src.executors_actual_hours),
			planned: toNum(src.executors_estimated_hours)
		},
		executorsBudget: {
			fact: toNum(src.executors_actual_budget),
			planned: toNum(src.executors_estimated_budget)
		}
	};
}
