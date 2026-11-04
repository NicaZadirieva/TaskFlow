import getBackendUrl from '@/utils/getBackendUrl';
import parseErrorMessage from '@/utils/parseErrorMessage';
import RequestError from '@/api/utils/error';

export default async function logInReqReal(
	email: string,
	password: string
): Promise<string> {
	let res: Response;

	try {
		res = await fetch(`${getBackendUrl()}/user/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password })
		});
	} catch (e) {
		console.error('Login network error:', e);
		throw new RequestError('Ошибка сети', 'NETWORK');
	}

	if (!res.ok) {
		const message = await parseErrorMessage(res, 'Invalid credentials');
		throw new RequestError(message, res.status);
	}

	const data = await res.json();
	if (typeof data?.jwt !== 'string') {
		throw new RequestError('Некорректный ответ сервера', 'INVALID_RESPONSE');
	}

	return data.jwt;
}