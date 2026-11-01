import type { ExecutorShortOut } from '@/api/dto/task/get_tasks/ExecutorShortOut';
import RequestError from '@/api/utils/error';
import getBackendUrl from '@/utils/getBackendUrl';
import parseErrorMessage from '@/utils/parseErrorMessage';

export default async function getAssigneeFiltersClientRealReq(): Promise<ExecutorShortOut[]> {
	let res: Response;

	try {
		res = await fetch(`${getBackendUrl()}/task/filters/assignees`, {
			method: 'GET',
			credentials: 'include',
			headers: { Accept: 'application/json' }
		});
	} catch (e) {
		console.error('getAssigneeFiltersClientRealReq network error:', e);
		throw new RequestError('Ошибка сети', 'NETWORK');
	}

	if (!res.ok) {
		const message = await parseErrorMessage(res, `HTTP ${res.status}`);
		throw new RequestError(message, res.status);
	}

	return (await res.json()) as ExecutorShortOut[];
}