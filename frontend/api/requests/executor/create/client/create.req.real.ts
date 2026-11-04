import type CreateExecutorRequest from '@/api/dto/executor/create/CreateExecutorRequest';
import type CreateExecutorResponse from '@/api/dto/executor/create/CreateExecutorResponse';
import RequestError from '@/api/utils/error';
import getBackendUrl from '@/utils/getBackendUrl';


export default async function createExecutorReqReal(
	dto: CreateExecutorRequest
) {
	let res: Response;

	try {
		res = await fetch(`${getBackendUrl()}/executor/create`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(dto),
			cache: 'no-store'
		});
	} catch (e) {
		console.error('createExecutorReqReal network error:', e);
		throw new RequestError('Ошибка сети', 'NETWORK');
	}

	if (res.status === 409) {
		throw new RequestError('Уже назначен', 409);
	}

	if (res.status === 403) {
		throw new RequestError('Нет прав', 403);
	}

	if (!res.ok) {
		throw new RequestError(`Ошибка ${res.status}`, res.status);
	}

	const data = (await res.json()) as CreateExecutorResponse;
	return data;
}