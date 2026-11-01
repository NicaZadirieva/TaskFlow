import type TasksOut from '@/api/dto/task/get_tasks/TasksOut';
import RequestError from '@/api/utils/error';
import getBackendUrl from '@/utils/getBackendUrl';
import parseErrorMessage from '@/utils/parseErrorMessage';

export async function getTasksClientReal(search?: URLSearchParams): Promise<TasksOut> {
	const qs = search?.toString();
	const url = `${getBackendUrl()}/task/all${qs ? `?${qs}` : ''}`;

	let res: Response;

	try {
		res = await fetch(url, {
			method: 'GET',
			credentials: 'include',
			headers: { Accept: 'application/json' }
		});
	} catch (e) {
		console.error('getTasksClientReal network error:', e);
		throw new RequestError('Ошибка сети', 'NETWORK');
	}

	if (!res.ok) {
		const message = await parseErrorMessage(res, `HTTP ${res.status}`);
		throw new RequestError(message, res.status);
	}

	return (await res.json()) as TasksOut;
}