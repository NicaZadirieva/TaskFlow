import isMockEnabled from '@/utils/isMockEnabled';
import getTasksReqMock from './req.mock';
import { getTasksReqReal } from './req.real';


export default async function getTasksReq(search?: URLSearchParams,) {
	if (isMockEnabled()) {
		return await getTasksReqMock(search);
	}
	return await getTasksReqReal(search);
}