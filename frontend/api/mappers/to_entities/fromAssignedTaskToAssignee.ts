import { AssignedTask } from '@/api/types/assigned-task.types';
import { Assignee } from '@/entities/assignee.interface';

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


