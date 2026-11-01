import { NewTask, TaskWithoutCreatedBy } from '@/utils/types';
import { CreateTaskRequest } from '../CreateTaskRequest';
import toCreateTaskExecutor from './toCreateTaskExecutor';

export function toCreateTaskRequest(task: TaskWithoutCreatedBy | NewTask): CreateTaskRequest {
	return {
		project_id: task.project_id ?? null,
		title: task.title,
		description: task.description ?? null,
		status: task.status,
		priority: task.priority,

		due_date: task.due_date ? task.due_date.toISOString() : null,
		estimated_budget:
            task.budget?.planned != null ? String(task.budget.planned) : null,
		actual_budget:
            task.budget?.fact != null ? String(task.budget.fact) : null,
		estimated_hours:
            task.hours?.planned != null ? String(task.hours.planned) : null,
		actual_hours:
            task.hours?.fact != null ? String(task.hours.fact) : null,

		note: task.note ?? null,
		task_images: task.task_images ?? null,
		tags: task.tags ?? null,
		executors: task.assignees?.map(toCreateTaskExecutor) ?? null
	};
}