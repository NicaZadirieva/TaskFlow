import RemoveUserFromTaskRequest from '@/api/dto/executor/remove/RemoveUserFromTaskRequest';
import { DeleteExecutorResult } from './remove.req.real';

export default async function removeExecutorFromTaskReqMock(dto: RemoveUserFromTaskRequest): Promise<DeleteExecutorResult> {
	return Promise.reject();
}