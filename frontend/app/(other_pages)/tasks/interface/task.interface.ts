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
}

export const STATUS_META: Record<Status, { color: string; label: string }> = {
  OPEN: { color: 'blue', label: 'open' },
  IN_PROGRESS: { color: 'orange', label: 'in progress' },
  DONE: { color: 'green', label: 'done' },
  BACKLOG: {color: 'yellow', label: 'backlog'}
};

export const PRIORITY_META: Record<Priority, {color: "success" | "error" | "default" | "warning" | "processing"; label: string}> = {
	LOW: { color: 'default', label: 'low'},
  HIGH: { color: 'warning', label: 'high'},
	CRITICAL: {color: 'error', label: 'high'},
	MEDIUM: {color: 'processing', label: 'medium'}
}