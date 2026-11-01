import isMockEnabled from '@/utils/isMockEnabled';
import removeExecutorFromTaskClientReqReal, { DeleteExecutorResult } from './remove.req.real';
import RemoveUserFromTaskRequest from '@/api/dto/executor/remove/RemoveUserFromTaskRequest';
import removeExecutorFromTaskReqMock from './remove.req.mock';

export default async function removeExecutorFromTaskReq(dto: RemoveUserFromTaskRequest): Promise<DeleteExecutorResult> {
	if (isMockEnabled()) {
		return await removeExecutorFromTaskReqMock(dto);
	}
	return await removeExecutorFromTaskClientReqReal(dto);
}