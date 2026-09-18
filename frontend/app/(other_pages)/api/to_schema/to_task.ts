import { Assignee } from '../../tasks/interface/assignee.interface';
import { Task } from '../../tasks/interface/task.interface';
import { Priority, Task as TaskDb, TaskStatus } from '@/app/shared/schema/task.types';
import { AssignedTask } from '@/app/shared/schema/assigned-task.types';
export function toTaskSchema(task: Task) {
	return {
		id: task.id,
		project_id: task.project_id,
		tenant_id: 12, // TODO: добавить из localStorage/cookie
		title: task.title,
		description: task.description,

		status: task.status as TaskStatus,
		priority: task.priority as Priority,
		tags: task.tags,

		due_date: task.due_date,
		estimated_hours: task.hours.planned,
		actual_hours: task.hours.fact,
		estimated_budget: task.budget.planned,
		actual_budget: task.budget.fact,

		created_by: task.created_by,
		created_at: task.created_at,
		assignees: task.assignees,

		note: task.note,
	} as TaskDb;
}

export function toAssigneeSchema(assignee: Assignee) {
	return assignee as AssignedTask;
}