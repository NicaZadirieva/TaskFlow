import type { CreateTaskRequest } from '@/api/dto/task/create/CreateTaskRequest';
import RequestError from '@/api/utils/error';
import getBackendUrl from '@/utils/getBackendUrl';
import parseErrorMessage from '@/utils/parseErrorMessage';

export default async function createTaskReqReal(task: CreateTaskRequest): Promise<true> {
	let res: Response;

	try {
		res = await fetch(`${getBackendUrl()}/task/create`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(task),
			cache: 'no-store'
		});
	} catch (e) {
		console.error('createTaskReqReal network error:', e);
		throw new RequestError('Ошибка сети', 'NETWORK');
	}

	if (!res.ok) {
		const message = await parseErrorMessage(res, `Ошибка ${res.status}`);
		throw new RequestError(message, res.status);
	}

	return true;
}