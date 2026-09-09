import { Task } from './task.types';
import { Tenant } from './tenant.types';

export interface Project {
  id: number;
  tenantId: number; 
  name: string;
  description?: string;
  budgetHours?: number;
  deadline?: Date;
  tenant?: Tenant;
  tasks?: Task[];
}