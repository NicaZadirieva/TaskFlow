import { Project } from './project.types';
import { Task } from './task.types';
import { User } from './user.types';

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  users?: User[];
  projects?: Project[];
  tasks?: Task[];
}