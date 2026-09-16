import { Project } from '@/app/shared/schema/project.types';
import isMockEnabled from '@/app/shared/utils/isMockEnabled';
import createProjectReqMock from './create_project.req.mock';
import createProjectReqReal from './create_project.req.real';

export default async function createProjectReq(project: Project) {
	if (isMockEnabled()) {
		return await createProjectReqMock(project);
	}
	return await createProjectReqReal(project);
}