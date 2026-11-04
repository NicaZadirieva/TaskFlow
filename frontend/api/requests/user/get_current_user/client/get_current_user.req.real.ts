import type GetCurrentUserResponse from '@/api/dto/user/get_current_user/GetCurrentUserResponse';
import RequestError from '@/api/utils/error';
import getBackendUrl from '@/utils/getBackendUrl';
import parseErrorMessage from '@/utils/parseErrorMessage';

export async function getCurrentUserRealClient(): Promise<GetCurrentUserResponse> {
	let res: Response;

	try {
		res = await fetch(`${getBackendUrl()}/user/current`, {
			method: 'GET',
			credentials: 'include',
			headers: { Accept: 'application/json' }
		});
	} catch (e) {
		console.error('getCurrentUserRealClient network error:', e);
		throw new RequestError('Ошибка сети', 'NETWORK');
	}

	if (!res.ok) {
		const message = await parseErrorMessage(res, `HTTP ${res.status}`);
		throw new RequestError(message, res.status);
	}

	const data = await res.json();
	if (data == null || typeof data !== 'object') {
		throw new RequestError('Некорректный ответ сервера', 'INVALID_RESPONSE');
	}
	return data as GetCurrentUserResponse;
}