import { Executor as ExecutorDto } from '@/api/types/assigned-task.types';
import { Executor } from '@/entities/executor.interface';

export function fromAssignedTaskToAssignee(src: ExecutorDto): Executor {
  return {
    id: src.id,
    login: src.login,
    email: src.email,
    user_id: src.user_id,
    user_name: src.user_name,
    task_id: src.task_id,
    tenant_id: src.tenant_id,
    role_in_task: src.role_in_task,
    assigned_at: src.assigned_at,
    is_active: src.is_active,
    hours: src.actual_hours,
    planned: src.estimated_hours,
    reassigned_reason: src.reassigned_reason,
    remove_reason: src.remove_reason,
    removed: src.removed,
    hourly_rate: src.hourly_rate
  };
}


