import { Assignee } from '../interfaces/assignee.interface';

export const assignee: Assignee = {
  id: 1,
  user_name: "Иван",
  user_id: 42,
  task_id: 100,
  tenant_id: 7,
  role_in_task: 'EXECUTOR',
  assigned_at: new Date('2026-09-18T10:00:00Z'),
  is_active: true,
  hours: 8,
  planned: 40,
};

export const reviewer: Assignee = {
  id: 2,
  user_id: 43,
  user_name: "Василиса",
  task_id: 100,
  tenant_id: 7,
  role_in_task: 'REVIEWER',
  assigned_at: new Date('2026-09-18T11:30:00Z'),
  is_active: true,
  hours: 2,
  planned: 4,
};