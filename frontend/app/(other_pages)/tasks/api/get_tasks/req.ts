import isMockEnabled from '@/app/shared/utils/isMockEnabled';
import getTasksReqMock from './req.mock';
import getTasksReqReal from './req.real';

export default async function getTasksReq() {
	if (isMockEnabled()) {
		return await getTasksReqMock();
	}
	return await getTasksReqReal();
}