import CreateExecutorRequest from '@/api/dto/executor/create/CreateExecutorRequest';
import isMockEnabled from '@/utils/isMockEnabled';
import createExecutorReqMock from '../create.req.mock';
import createExecutorReqReal from './create.req.real';

export default async function createExecutorReq(
	dto: CreateExecutorRequest
) {
	if (isMockEnabled()) {
		return await createExecutorReqMock(dto);
	}
	return await createExecutorReqReal(dto);
}
