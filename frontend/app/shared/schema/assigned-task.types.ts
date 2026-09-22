export interface AssignedTask {
  id: number;
  userName: string; // TODO: вычислить в БД
  userId: number;
  taskId: number;
  tenantId: number;
  roleInTask: string;
  assignedAt: Date;
  isActive: boolean;
  actualHours: number; // TODO: добавить в БД
  estimatedHours: number; // TODO: добавить в БД
  removed?: boolean;
  remove_reason?: string;
  reassigned_reason?: string;
  hourly_rate?: number;
}