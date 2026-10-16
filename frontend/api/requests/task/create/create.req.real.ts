import { CreateTaskRequest } from "@/api/dto/task/create/CreateTaskRequest";
import RequestError from "@/api/utils/error";
import getBackendUrl from "@/utils/getBackendUrl";
import parseErrorMessage from "@/utils/parseErrorMessage";

export default async function createTaskReqReal(task: CreateTaskRequest) {
    const res = await fetch(`${getBackendUrl()}/task/create`, {
        method: 'POST',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
    });

    if (!res.ok) {
        const message = await parseErrorMessage(res, 'Invalid credentials');
        throw new RequestError(message, res.status);
    }
    return true;
}