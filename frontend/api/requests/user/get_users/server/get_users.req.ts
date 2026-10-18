import isMockEnabled from '@/utils/isMockEnabled';

import getUsersReqMock from '../get_users.req.mock';
import { getUsersServerReq } from './get_users.req.real';

export default async function getServerUsersReq() {
    if (isMockEnabled()) {
        return await getUsersReqMock();
    }
    return await getUsersServerReq();
}