"use server";

import { Task } from "@/api/types/task.types";
import RequestError from "@/api/utils/error";
import getBackendUrl from "@/utils/getBackendUrl";
import { cookies } from "next/headers";

export default async function createTaskReqReal(task: Omit<Task, 'created_by'>) {
    const token = (await cookies()).get('jwt')?.value;

    const res = await fetch(`${getBackendUrl()}/task/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(task),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new RequestError(errorData.detail || 'Invalid credentials', res.status);
    }
    return true;
}