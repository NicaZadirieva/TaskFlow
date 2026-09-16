import { IProject } from '@/app/shared/interface/project.interface';
import { Project } from '@/app/shared/schema/project.types';

export function toProjectSchema(projectDto: IProject) {
	return projectDto as Project;
}

export function toNewProjectSchema(projectDto: Omit<IProject, 'id'>) {
	return projectDto as Project;
}