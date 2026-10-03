import { User } from '@/api/types/user.types';
import isMockEnabled from '@/utils/isMockEnabled';
import changeUserReqMock from './change_user.req.mock';
import changeUserReqReal from './change_user.req.real';

export default async function changeUserReq(userId: number, newUser: User) {
	if (isMockEnabled()) {
		return await changeUserReqMock(userId, newUser);
	}
	return await changeUserReqReal(userId, newUser);
}