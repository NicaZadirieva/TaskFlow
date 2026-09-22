import isMockEnabled from '@/app/shared/utils/isMockEnabled';
import getTaskReqMock from './get_task.req.mock';
import getTaskReqReal from './get_task.req.real';

export default async function getTaskReq(taskId: number) {
	if (isMockEnabled()) {
		return await getTaskReqMock(taskId);
	}
	return await getTaskReqReal(taskId);
}