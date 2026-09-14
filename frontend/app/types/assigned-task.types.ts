import { TaskRole } from './task.types';

export interface AssignedTask {
  id: number;
  userId: number;
  taskId: number;
  tenantId: number;
  roleInTask: TaskRole;
  assignedAt: Date;
  isActive: boolean;
}