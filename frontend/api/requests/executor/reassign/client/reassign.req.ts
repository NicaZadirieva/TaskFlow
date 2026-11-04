import ReassignedUserTaskRequest from '@/api/dto/executor/reassign/ReassignedUserTaskRequest';
import ReassignedUserTaskResponse from '@/api/dto/executor/reassign/ReassignedUserTaskResponse';
import isMockEnabled from '@/utils/isMockEnabled';
import reassignExecutorToTaskReqMock from '../reassign.req.mock';
import reassignExecutorToTaskReqReal from './reassign.req.real';

export default async function reassignExecutorToTaskReq(dto: ReassignedUserTaskRequest): Promise<ReassignedUserTaskResponse> {
	if (isMockEnabled()) {
		return await reassignExecutorToTaskReqMock(dto);
	}
	return await reassignExecutorToTaskReqReal(dto);
}