import { cookies } from "next/headers";

import TasksOut from "@/api/dto/task/get_tasks/TasksOut";
import getBackendUrl from "@/utils/getBackendUrl";

export async function getTasksReqReal(
	search?: URLSearchParams,
): Promise<TasksOut | null> {
	const qs = search?.toString();
	const url = `${getBackendUrl()}/task/all${qs ? `?${qs}` : ""}`;

	const cookieStore = await cookies();

	const res = await fetch(url, {
		method: "GET",
		cache: "no-store",
		credentials: "include",
		headers: {
			Accept: "application/json",
			Cookie: cookieStore.toString(),
		},
	});

	if (!res.ok) {
		if (process.env.NODE_ENV !== "production") {
			const text = await res.text().catch(() => "");
			console.error(`[getTasksReqReal] ${res.status} ${res.statusText}`, text);
		}
		return null;
	}

	return (await res.json()) as TasksOut;
}