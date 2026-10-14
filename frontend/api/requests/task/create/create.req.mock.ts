import { Task } from "@/api/types/task.types";

export default async function createTaskReqMock(task: Omit<Task, 'created_by'>) {
    return Promise.resolve(
        true
    );
}