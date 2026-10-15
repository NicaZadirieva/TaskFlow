import { Executor } from './assigned-task.types';
import GithubLabel from './github-label.types';
import ITaskNote from './note.types';
import { User } from './user.types';

export type TaskStatus = 'BACKLOG' | 'IN_PROGRESS' | 'OPEN' | 'DONE';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id?: number;
  projectId?: number;
  title: string;
  description?: string;

  status: TaskStatus;
  priority: Priority;

  due_date?: Date;
  estimated_hours?: number;
  actual_hours?: number;

  estimated_budget?: number;
  actual_budget?: number;
  overdue_days?: number; // TODO: вычислить в БД

  note?: ITaskNote;
  created_by?: number;
  created_at: Date;

  created_by_user?: Pick<User, 'id' | 'name'>;
  executors?: Executor[];

  task_images?: string[];
  tags?: GithubLabel[]; 
}

export interface TasksWithTags {
  tasks: Task[],
  allTags?: GithubLabel[],
  allAssignees?: {
    userId: number,
    userName: string,
    tenantId: number
  }[]
}