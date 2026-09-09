import isMockEnabled from '@/app/shared/utils/isMockEnabled';
import getUserReqMock from './get_user.req.mock';
import getUserReqReal from './get_user.req.real';

export default async function getUserReq(email: string, password: string) {
	if (isMockEnabled()) {
		return await getUserReqMock(email, password)
	}
	return await getUserReqReal(email, password);
}