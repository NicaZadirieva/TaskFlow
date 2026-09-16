import { Task } from './task.types';
import { Tenant } from './tenant.types';

export interface Project {
  id: number;
  tenant_id: number; 
  name: string;
  description?: string;
  budget_hours?: number;
  deadline?: Date;
  tenant?: Tenant;
  tasks?: Task[];
}