import { Priority } from '@/api/types/task.types';
import { Status } from '@/entities/task.interface';
import { fromAssignedTaskToAssignee } from './fromAssignedTaskToAssignee';
import { fromNoteDto } from './fromNoteDto';
import { TaskOut } from '@/api/dto/task/get_tasks/TaskOut';

// TODO: сделать проще и читабельнее
/** Decimal-строка / number / null / undefined -> number. */
function toNum(v: string | number | null | undefined, fallback = 0): number {
	if (v == null) return fallback;
	const n = typeof v === 'string' ? Number(v) : v;
	return Number.isFinite(n) ? n : fallback;
}

export function fromTaskDto(src: TaskOut) {
	const actual = toNum(src.actual_hours);
	const estimated = toNum(src.estimated_hours);

	const executorsActual = toNum(src.executors_actual_hours);
	const executorsEstimated = toNum(src.executors_estimated_hours);

	return {
		id: src.id,
		project_id: src.project_id ?? undefined,
		title: src.title,
		status: src.status as Status,
		description: src.description ?? undefined,

		hours: { fact: actual, planned: estimated },
		budget: {
			fact: toNum(src.actual_budget),
			planned: toNum(src.estimated_budget),
		},
		due_date: src.due_date ? new Date(src.due_date) : new Date(0),
		overdueDays: src.overdue_days ?? 0,
		note: src.note ? fromNoteDto(src.note) : undefined,
		assignees: (src.executors ?? []).map(fromAssignedTaskToAssignee),
		tags: src.tags,
		priority: src.priority as Priority,
		created_by: src.created_by,
		created_at: new Date(src.created_at),
		task_images: src.task_images ?? undefined,

		// === новые агрегаты из исполнителей ===
		executorsHours: {
			fact: executorsActual,
			planned: executorsEstimated,
		},
		executorsBudget: {
			fact: toNum(src.executors_actual_budget),
			planned: toNum(src.executors_estimated_budget),
		},
	};
}