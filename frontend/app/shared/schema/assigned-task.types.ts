export interface AssignedTask {
  id: number;
  user_id: number;
  task_id: number;
  tenant_id: number;
  role_in_task: string;
  assigned_at: Date;
  is_active: boolean;
  // TODO: добавить ставку исполнителя для конкретной задачи в БД
  hours: number;
  planned: number;
  removed?: boolean;
  remove_reason?: string;
  reassigned_reason?: string;
  user_name: string; // вычисляется внутри БД
}