import ReassignedUserTaskRequest from '@/api/dto/executor/reassign/ReassignedUserTaskRequest';
import ReassignedUserTaskResponse from '@/api/dto/executor/reassign/ReassignedUserTaskResponse';

export default async function reassignExecutorToTaskReqMock(dto: ReassignedUserTaskRequest): Promise<ReassignedUserTaskResponse> {
	return {
		id: 0,
		user_id: 0,
		task_id: 0
	};
}