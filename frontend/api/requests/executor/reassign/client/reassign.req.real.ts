
import ReassignedUserTaskRequest from '@/api/dto/executor/reassign/ReassignedUserTaskRequest';
import ReassignedUserTaskResponse from '@/api/dto/executor/reassign/ReassignedUserTaskResponse';
import RequestError from '@/api/utils/error';
import getBackendUrl from '@/utils/getBackendUrl';


export default async function reassignExecutorToTaskReqReal(
	dto: ReassignedUserTaskRequest
): Promise<ReassignedUserTaskResponse> {
	let res: Response;

	try {
		res = await fetch(`${getBackendUrl()}/executor/reassign`, {
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

	const data = (await res.json()) as ReassignedUserTaskResponse;
	return data;
}