import RemoveUserFromTaskRequest from '@/api/dto/executor/remove/RemoveUserFromTaskRequest';
import RemoveUserFromTaskResponse from '@/api/dto/executor/remove/RemoveUserFromTaskResponse';

// TODO: дописать
export default async function removeExecutorFromTaskReqMock(
	dto: RemoveUserFromTaskRequest
): Promise<RemoveUserFromTaskResponse> {
	return Promise.reject();
}
