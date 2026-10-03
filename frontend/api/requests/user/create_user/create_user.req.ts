import { User } from '@/api/types/user.types';
import isMockEnabled from '@/utils/isMockEnabled';
import createUserReqReal from './change_user.req.real';
import createUserReqMock from './create_user.req.mock';

export default async function createUserReq(newUser: User) {
	if (isMockEnabled()) {
		return await createUserReqMock(newUser);
	}
	return await createUserReqReal(newUser);
}