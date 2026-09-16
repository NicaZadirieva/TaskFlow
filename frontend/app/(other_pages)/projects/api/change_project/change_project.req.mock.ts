import { Project } from '@/app/shared/schema/project.types';

export default async function changeProjectReqMock(projectId: number, newProject: Project) {
	return Promise.resolve();
}