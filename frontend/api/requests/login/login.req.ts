import isMockEnabled from '@/utils/isMockEnabled';
import logInReqMock from './login.req.mock';
import logInReqReal from './login.req.real';

export default async function logInReq(email: string, password: string) {
	if (isMockEnabled()) {
		return await logInReqMock(email, password)
	}
	return await logInReqReal(email, password);
}