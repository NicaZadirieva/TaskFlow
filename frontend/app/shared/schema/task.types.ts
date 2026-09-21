import { AssignedTask } from './assigned-task.types';
import { User } from './user.types';

export type TaskStatus = 'Backlog' | 'ToDo' | 'InProgress' | 'Review' | 'Done';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskRole = 'EXECUTOR' | 'REVIEWER';

export interface Task {
  id: number;
  tenantId: number;
  projectId?: number;
  title: string;
  description?: string;

  status: TaskStatus;
  priority: Priority;

  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;

  createdBy: number;
  createdAt: Date;

  createdByUser?: Pick<User, 'id' | 'name'>;
  assignees?: AssignedTask[];

  task_images?: string[];
}