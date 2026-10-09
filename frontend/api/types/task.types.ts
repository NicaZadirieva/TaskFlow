import { AssignedTask } from './assigned-task.types';
import GithubLabel from './github-label.types';
import ITaskNote from './note.types';
import { User } from './user.types';

export type TaskStatus = 'BACKLOG' | 'IN_PROGRESS' | 'OPEN' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

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

  estimatedBudget?: number;
  actualBudget?: number;
  overdueDays?: number; // TODO: вычислить в БД

  note?: ITaskNote;
  createdBy: number;
  createdAt: Date;

  createdByUser?: Pick<User, 'id' | 'name'>;
  assignees?: AssignedTask[];

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