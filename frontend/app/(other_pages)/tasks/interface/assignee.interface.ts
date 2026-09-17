export interface Assignee {
  id: number;
  user_id: number;
  name: string;
  role: string;
  // TODO: добавить ставку исполнителя для конкретной задачи в БД
  hours: number;
  planned: number;
  removed?: boolean;
  removeReason?: string;
  reassignedReason?: string;
}