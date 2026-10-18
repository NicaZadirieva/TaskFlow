import { ExecutorShortOut } from "@/api/dto/task/get_tasks/ExecutorShortOut";
import getBackendUrl from "@/utils/getBackendUrl";

export default async function getAssigneeFiltersClientRealReq() {
    const res = await fetch(`${getBackendUrl()}/task/filters/assignees`, {
    method: "GET",
    // ВАЖНО: не "no-store" — TanStack Query сам управляет кэшем
    credentials: "include",   // браузер приложит cookies сам
    headers: { Accept: "application/json" },
    // ETag браузер обработает сам, если сервер вернёт заголовок
  });

  // 304 — данные не изменились. Браузер отдаст закэшированное тело
  // (при Cache-Control: no-cache), но fetch вернёт пустой res.body.
  // Проще: не полагаться на кэш fetch, а на кэш TanStack Query.
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return (await res.json()) as ExecutorShortOut[];
}