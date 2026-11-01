import { cookies } from 'next/headers';

import type { ExecutorShortOut } from '@/api/dto/task/get_tasks/ExecutorShortOut';
import RequestError from '@/api/utils/error';
import getBackendUrl from '@/utils/getBackendUrl';
import parseErrorMessage from '@/utils/parseErrorMessage';

export async function getFilterAssigneesRealServer(): Promise<ExecutorShortOut[]> {
	let res: Response;

	try {
		const cookieStore = await cookies();
		const cookieHeader = cookieStore
			.getAll()
			.map((c) => `${c.name}=${c.value}`)
			.join('; ');

		res = await fetch(`${getBackendUrl()}/task/filters/assignees`, {
			cache: 'no-store',
			headers: {
				Accept: 'application/json',
				...(cookieHeader ? { Cookie: cookieHeader } : {})
			}
		});
	} catch (e) {
		console.error('getFilterAssigneesRealServer network error:', e);
		throw new RequestError('Ошибка сети', 'NETWORK');
	}

	if (!res.ok) {
		const message = await parseErrorMessage(res, `HTTP ${res.status}`);
		throw new RequestError(message, res.status);
	}

	return (await res.json()) as ExecutorShortOut[];
}