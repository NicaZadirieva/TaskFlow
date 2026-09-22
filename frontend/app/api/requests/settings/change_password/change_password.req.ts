import isMockEnabled from '@/app/shared/utils/isMockEnabled';
import changePasswordReqMock from './change_password.req.mock';
import changePasswordReqReal from './change_password.req.real';
import { User } from '@/app/shared/schema/user.types';


export default async function changePasswordReq(user: User, new_password: string) {
	if (isMockEnabled()) {
		return await changePasswordReqMock(user, new_password);
	}
	return await changePasswordReqReal(user, new_password);
}