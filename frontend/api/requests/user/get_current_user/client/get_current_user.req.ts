import isMockEnabled from '@/utils/isMockEnabled';
import { getCurrentUserMock } from '../get_current_user.req.mock';
import { getCurrentUserRealClient } from './get_current_user.req.real';



export default async function getCurrentUserClientReq() {
	if (isMockEnabled()) {
		return await getCurrentUserRealClient();
	}
	return await getCurrentUserMock();
}