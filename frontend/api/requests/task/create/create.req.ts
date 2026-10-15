import { Task } from '@/api/types/task.types';
import isMockEnabled from '@/utils/isMockEnabled';
import createTaskReqMock from './create.req.mock';
import createTaskReqReal from './create.req.real';


export default async function createTaskReq(task: Omit<Task, 'created_by'>) {
    if (isMockEnabled()) {
        return await createTaskReqMock(task);
    }
    return await createTaskReqReal(task);
}