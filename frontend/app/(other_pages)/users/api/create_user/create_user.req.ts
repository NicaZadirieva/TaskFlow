import isMockEnabled from '@/app/shared/utils/isMockEnabled';
import { User } from '@/app/shared/schema/user.types';
import createUserReqMock from './create_user.req.mock';
import createUserReqReal from './change_user.req.real';

export default async function createUserReq(newUser: User) {
	if (isMockEnabled()) {
		return await createUserReqMock(newUser);
	}
	return await createUserReqReal(newUser);
}