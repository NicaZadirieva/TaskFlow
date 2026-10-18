import isMockEnabled from '@/utils/isMockEnabled';
import getUsersReqMock from '../get_users.req.mock';
import { getUsersClient } from './get_users.req.real';


export default async function getClientUsersReq() {
    if (isMockEnabled()) {
        return await getUsersReqMock();
    }
    return await getUsersClient();
}