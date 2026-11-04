import { cookies } from 'next/headers';

import type TasksOut from '@/api/dto/task/get_tasks/TasksOut';
import RequestError from '@/api/utils/error';
import getBackendUrl from '@/utils/getBackendUrl';
import parseErrorMessage from '@/utils/parseErrorMessage';

export async function getTasksServerReal(search?: URLSearchParams): Promise<TasksOut> {
	const qs = search?.toString();
	const url = `${getBackendUrl()}/task/all${qs ? `?${qs}` : ''}`;

	let res: Response;

	try {
		const cookieStore = await cookies();
		const cookieHeader = cookieStore
			.getAll()
			.map((c) => `${c.name}=${c.value}`)
			.join('; ');

		res = await fetch(url, {
			method: 'GET',
			cache: 'no-store',
			headers: {
				Accept: 'application/json',
				...(cookieHeader ? { Cookie: cookieHeader } : {})
			}
		});
	} catch (e) {
		console.error('getTasksServerReal network error:', e);
		throw new RequestError('Ошибка сети', 'NETWORK');
	}

	if (!res.ok) {
		const message = await parseErrorMessage(
			res,
			`${res.status} ${res.statusText}`
		);
		throw new RequestError(message, res.status);
	}

	return (await res.json()) as TasksOut;
}