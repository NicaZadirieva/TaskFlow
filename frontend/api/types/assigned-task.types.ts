export interface Executor {
  id?: number;
  user_name: string; // TODO: вычислить в БД
  user_id: number;
  task_id?: number;
  tenant_id?: number;
  role_in_task: string;
  assigned_at?: Date; // TODO: добавить дату на бэке
  is_active: boolean;
  actual_hours: number; // TODO: добавить в БД
  estimated_hours: number; // TODO: добавить в БД
  removed?: boolean;
  remove_reason?: string;
  reassigned_reason?: string;
  hourly_rate?: number;
  login: string;
  email: string;
}