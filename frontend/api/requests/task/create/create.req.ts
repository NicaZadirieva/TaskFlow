import { CreateTaskRequest } from '@/api/dto/task/create/CreateTaskRequest';
import isMockEnabled from '@/utils/isMockEnabled';
import createTaskReqMock from './create.req.mock';
import createTaskReqReal from './create.req.real';


export default async function createTaskReq(task: CreateTaskRequest) {
    if (isMockEnabled()) {
        return await createTaskReqMock(task);
    }
    return await createTaskReqReal(task);
}