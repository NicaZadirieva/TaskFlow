import { CreateTaskRequest } from "@/api/dto/task/create/CreateTaskRequest";

export default async function createTaskReqMock(task: CreateTaskRequest) {
    return Promise.resolve(
        true
    );
}