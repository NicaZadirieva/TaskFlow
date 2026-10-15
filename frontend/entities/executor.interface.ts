export interface Executor {
  id: number;
  user_id: number;
  user_name: string; // вычисляется внутри БД
  task_id: number;
  tenant_id: number;
  role_in_task: string; // TODO: добавить в интерфейс вместо role
  assigned_at?: Date;
  is_active: boolean;
  // TODO: добавить ставку исполнителя для конкретной задачи в БД
  hours: number;
  planned: number;
  removed?: boolean;
  remove_reason?: string;
  reassigned_reason?: string;
  hourly_rate?: number; // TODO: добавить в интерфейс через БД (связь user <-> Executor)
}