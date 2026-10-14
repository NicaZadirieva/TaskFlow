import { Task } from "@/api/types/task.types";
import RequestError from "@/api/utils/error";
import getBackendUrl from "@/utils/getBackendUrl";

export default async function createTaskReqReal(task: Omit<Task, 'created_by'>) {
    const res = await fetch(`${getBackendUrl()}/task/create`, {
        method: 'POST',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new RequestError(errorData.detail || 'Invalid credentials', res.status);
    }
    return true;
}