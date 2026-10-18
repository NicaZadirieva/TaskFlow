import { cookies } from "next/headers";

import { ExecutorShortOut } from "@/api/dto/task/get_tasks/ExecutorShortOut";
import getBackendUrl from "@/utils/getBackendUrl";

export async function getFilterAssigneesRealServer(): Promise<ExecutorShortOut[]> {
    const cookieStore = await cookies();
    const res = await fetch(`${getBackendUrl()}/task/filters/assignees`, {
        cache: "no-store",
        headers: { Accept: "application/json", Cookie: cookieStore.toString() },
    });
    if (!res.ok) throw new Error(`[getFilterAssigneesServer] ${res.status}`);
    return await res.json();
}