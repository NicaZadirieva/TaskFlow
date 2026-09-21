import { Assignee } from './assignee.interface';
import { GithubLabel } from './githubLabel.interface';

// TODO: добавить OPEN в backend
export type Status = 'OPEN' | 'BACKLOG' | 'IN_PROGRESS' | 'DONE';

export type Priority = 'LOW' | 'HIGH' | 'MEDIUM' | 'CRITICAL';

export interface Task {
  id: number;
  project_id?: number; 
  title: string;
  status: Status;
  description?: string; // TODO: добавить в интерфейс
  hours: { fact: number; planned: number; };
  // TODO: добавить estimated_budget, actial_budget в БД
  budget: { fact: number; planned: number };
  estimate: { planned: number; fact: number };
  ratio: number | null; // TODO: посчитать через БД и вернуть
  due_date: Date; // TODO: перевести datetime schema Task
  overdueDays: number; // TODO: посчитать через БД и вернуть
  // jsonb
  note?: { kind: 'danger' | 'info'; label: string; text: string };
  assignees: Assignee[];
  tags?: GithubLabel[];
  priority: Priority;
  // TODO: добавить в интерфейс
  created_by: number;
  created_at: Date;
  // TODO: добавить в БД
  task_images?: string[];
}


