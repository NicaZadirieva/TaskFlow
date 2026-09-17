export interface Assignee {
  id: string;
  name: string;
  role: string;
  // TODO: добавить ставку исполнителя для конкретной задачи в БД
  hours: number;
  planned: number;
}