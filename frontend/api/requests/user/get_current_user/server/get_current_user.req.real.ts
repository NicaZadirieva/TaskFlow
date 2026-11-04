import type GetCurrentUserResponse from '@/api/dto/user/get_current_user/GetCurrentUserResponse';
import RequestError from '@/api/utils/error';
import getBackendUrl from '@/utils/getBackendUrl';
import parseErrorMessage from '@/utils/parseErrorMessage';
import { cookies } from 'next/headers';

export async function getCurrentUserRealServer(): Promise<GetCurrentUserResponse> {
	const url = `${getBackendUrl()}/user/current`;

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
		console.error('getCurrentUserRealServer network error:', e);
		throw new RequestError('Ошибка сети', 'NETWORK');
	}

	if (!res.ok) {
		const message = await parseErrorMessage(res, `${res.status} ${res.statusText}`);
		throw new RequestError(message, res.status);
	}

	const data = await res.json();
	if (data == null || typeof data !== 'object') {
		throw new RequestError('Некорректный ответ сервера', 'INVALID_RESPONSE');
	}
	return data as GetCurrentUserResponse;
}