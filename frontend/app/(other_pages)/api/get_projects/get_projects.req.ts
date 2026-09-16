import isMockEnabled from '@/app/shared/utils/isMockEnabled';
import getProjectsReqMock from './get_projects.req.mock';
import getProjectsRealReq from './get_project.req.real';

export default async function getProjectsReq() {
	if (isMockEnabled()) {
		return await getProjectsReqMock();
	}
	return await getProjectsRealReq();
}