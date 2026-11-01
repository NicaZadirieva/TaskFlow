
import { ExecutorShortOut } from '@/api/dto/task/get_tasks/ExecutorShortOut';
import { Executor } from '@/entities/executor.interface';

export function fromAssignedTaskToAssignee(src: ExecutorShortOut): Executor {
	return {
		id: src.id,
		login: src.login,
		email: src.email,
		user_id: src.user_id,
		user_name: src.name,          // было user_name
		role_in_task: src.role_in_task,
		is_active: src.is_active,
		hours: src.hours ?? undefined,             // было actual_hours
		planned: src.planned ?? undefined,   // было estimated_hours
		reassigned_reason: src.reassigned_reason ?? undefined,
		remove_reason: src.remove_reason ?? undefined,
		removed: src.removed,
		hourly_rate: src.hourly_rate ?? undefined,
	};
}


