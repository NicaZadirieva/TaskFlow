import RemoveUserFromTaskRequest from '@/api/dto/executor/remove/RemoveUserFromTaskRequest';
import RemoveUserFromTaskResponse from '@/api/dto/executor/remove/RemoveUserFromTaskResponse';
import RequestError from '@/api/utils/error';
import getBackendUrl from '@/utils/getBackendUrl';

export default async function removeExecutorFromTaskClientReqReal(
	dto: RemoveUserFromTaskRequest
): Promise<RemoveUserFromTaskResponse> {
	let res: Response;

	try {
		res = await fetch(`${getBackendUrl()}/executor/remove`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(dto),
			cache: 'no-store'
		});
	} catch (e) {
		console.error('removeExecutorFromTaskClientReqReal network error:', e);
		throw new RequestError('Ошибка сети', 'NETWORK');
	}

	if (res.status === 403) {
		throw new RequestError('Нет прав', 403);
	}

	if (!res.ok) {
		throw new RequestError(`Ошибка ${res.status}`, res.status);
	}

	const data = (await res.json()) as RemoveUserFromTaskResponse;
	return data;
}