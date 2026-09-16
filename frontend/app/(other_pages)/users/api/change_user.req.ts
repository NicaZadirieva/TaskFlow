import isMockEnabled from '@/app/shared/utils/isMockEnabled';
import changeUserReqMock from './change_user.req.mock';
import changeUserReqReal from './change_user.req.real';
import { User } from '@/app/shared/schema/user.types';

export default async function changeUserReq(userId: number, newUser: User) {
	if (isMockEnabled()) {
		return await changeUserReqMock(userId, newUser);
	}
	return await changeUserReqReal(userId, newUser);
}