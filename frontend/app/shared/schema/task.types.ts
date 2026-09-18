import { AssignedTask } from './assigned-task.types';
import { User } from './user.types';

export type TaskStatus = 'Backlog' | 'ToDo' | 'InProgress' | 'Review' | 'Done';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskRole = 'EXECUTOR' | 'REVIEWER';

// GitHub label: color — hex БЕЗ '#'
export type GithubLabel = {
  id?: number;
  name: string;
  color: string;        // hex без '#'
  description?: string | null;
  default?: boolean;
};

export interface Task {
  id: number;
  tenant_id: number;
  project_id?: number;
  title: string;
  description?: string;

  status: TaskStatus;
  priority: Priority;
  tags?: GithubLabel[];

  due_date?: Date;

  estimated_hours?: number;
  actual_hours?: number;
  // TODO: добавить в БД
  estimated_budget?: number;
  actual_budget?: number;

  created_by: number;
  created_at: Date;

  note?: { kind: 'danger' | 'info'; label: string; text: string };

  created_by_user?: Pick<User, 'id' | 'name'>;
  assignees?: AssignedTask[];
}