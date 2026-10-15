import { Executor } from './executor.interface';
import { GithubLabel } from './githubLabel.interface';

// TODO: добавить OPEN в backend
export type Status = 'OPEN' | 'BACKLOG' | 'IN_PROGRESS' | 'DONE';

export type Priority = 'low' | 'high' | 'medium' | 'critical';

export interface Task {
  id?: number;
  project_id?: number; 
  title: string;
  status: Status;
  description?: string; // TODO: добавить в интерфейс
  hours: { fact?: number; planned?: number; };
  // TODO: добавить estimated_budget, actial_budget в БД
  budget: { fact?: number; planned?: number };
  due_date: Date; // TODO: перевести datetime schema Task
  overdueDays: number; // TODO: посчитать через БД и вернуть
  // jsonb
  note?: { kind: 'danger' | 'info'; label: string; text: string };
  assignees: Executor[];
  tags?: GithubLabel[];
  priority: Priority;
  // TODO: добавить в интерфейс
  created_by: number;
  created_at: Date;
  // TODO: добавить в БД
  task_images?: string[];
}


