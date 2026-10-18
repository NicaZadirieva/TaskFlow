import { cookies } from "next/headers";

import TasksOut from "@/api/dto/task/get_tasks/TasksOut";
import getBackendUrl from "@/utils/getBackendUrl";

/**
 * Серверная загрузка задач — для initialData в RSC.
 * Использует cookie текущего запроса, чтобы FastAPI вернул данные
 * для аутентифицированного пользователя.
 *
 * ⚠️ Не использовать в "use client" — next/headers доступен только на сервере.
 * В браузере используйте getTasksClient (credentials: "include").
 */
export async function getTasksServerReal(search?: URLSearchParams): Promise<TasksOut> {
    const qs = search?.toString();
    const url = `${getBackendUrl()}/task/all${qs ? `?${qs}` : ""}`;

    const cookieStore = await cookies();

    const res = await fetch(url, {
        method: "GET",
        // RSC-запрос не должен попадать в Data Cache Next.js —
        // актуальность обеспечивает TanStack Query на клиенте.
        cache: "no-store",
        headers: {
            Accept: "application/json",
            Cookie: cookieStore.toString(),
        },
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
            `[getTasksServer] ${res.status} ${res.statusText}${text ? ` — ${text}` : ""}`,
        );
    }

    return (await res.json()) as TasksOut;
}