import isMockEnabled from '@/utils/isMockEnabled';
import getTasksReqMock from '../req.mock';
import { getTasksClientReal } from './req.real';


export default async function getTasksClientReq(search?: URLSearchParams,) {
	if (isMockEnabled()) {
		return await getTasksReqMock(search);
	}
	return await getTasksClientReal(search);
}