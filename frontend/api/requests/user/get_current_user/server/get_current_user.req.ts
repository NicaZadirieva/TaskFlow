import isMockEnabled from '@/utils/isMockEnabled';
import { getCurrentUserMock } from '../get_current_user.req.mock';
import { getCurrentUserRealServer } from './get_current_user.req.real';



export default async function getCurrentUserServerReq() {
	if (isMockEnabled()) {
		return await getCurrentUserMock();
	}
	return await getCurrentUserRealServer();
}