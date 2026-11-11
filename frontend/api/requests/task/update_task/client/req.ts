import type { Task } from '@/entities/task.interface';
import { toCreateTaskRequest } from '@/api/dto/task/create/mapper/toCreateTaskRequest';
import RequestError from '@/api/utils/error';
import getBackendUrl from '@/utils/getBackendUrl';
import isMockEnabled from '@/utils/isMockEnabled';
import parseErrorMessage from '@/utils/parseErrorMessage';

export default async function updateTask(task: Task, version: number): Promise<number> {
	if (isMockEnabled()) throw new Error('Сохранение задачи недоступно в демонстрационном режиме');
	const data = toCreateTaskRequest(task);
	const response = await fetch(`${getBackendUrl()}/task/${task.id}`, {
		method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ ...data, due_date: task.due_date?.getTime() === 0 ? null : data.due_date, tags: data.tags ?? [], version })
	});
	if (!response.ok) throw new RequestError(await parseErrorMessage(response, response.statusText), response.status);
	return ((await response.json()) as { version: number }).version;
}
