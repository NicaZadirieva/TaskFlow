import { cookies } from 'next/headers';

import type { TaskOut } from '@/api/dto/task/get_tasks/TaskOut';
import RequestError from '@/api/utils/error';
import getBackendUrl from '@/utils/getBackendUrl';
import parseErrorMessage from '@/utils/parseErrorMessage';

export default async function getTaskReqReal(taskId: number): Promise<TaskOut> {
	const url = `${getBackendUrl()}/task/${taskId}`;

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
		console.error('getTaskReqReal network error:', e);
		throw new RequestError('Ошибка сети', 'NETWORK');
	}

	if (!res.ok) {
		const message = await parseErrorMessage(
			res,
			`${res.status} ${res.statusText}`
		);
		throw new RequestError(message, res.status);
	}

	return (await res.json()) as TaskOut;
}