import isMockEnabled from '@/utils/isMockEnabled';
import getUsersReqMock from './get_users.req.mock';
import getUsersReqReal from './get_users.req.real';

export default async function getUsersReq() {
	if (isMockEnabled()) {
		return await getUsersReqMock();
	}
	return await getUsersReqReal();
}