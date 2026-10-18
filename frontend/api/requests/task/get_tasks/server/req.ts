import isMockEnabled from '@/utils/isMockEnabled';
import getTasksReqMock from '../req.mock';
import { getTasksServerReal } from './req.real';


export default async function getTasksServerReq(search?: URLSearchParams) {
    if (isMockEnabled()) {
        return await getTasksReqMock(search);
    }
    return await getTasksServerReal(search);
}