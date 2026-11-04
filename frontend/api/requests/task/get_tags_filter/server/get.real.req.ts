import type GithubLabelOut from '@/api/dto/github_label/get_all/GithubLabelOut';
import RequestError from '@/api/utils/error';
import getBackendUrl from '@/utils/getBackendUrl';
import parseErrorMessage from '@/utils/parseErrorMessage';
import { cookies } from 'next/headers';

export default async function getTagsFilterServerReal(): Promise<GithubLabelOut[]> {
	let res: Response;

	try {
		const cookieStore = await cookies();
		const cookieHeader = cookieStore
			.getAll()
			.map((c) => `${c.name}=${c.value}`)
			.join('; ');

		res = await fetch(`${getBackendUrl()}/task/filters/tags`, {
			cache: 'no-store',
			headers: {
				Accept: 'application/json',
				...(cookieHeader ? { Cookie: cookieHeader } : {})
			}
		});
	} catch (e) {
		console.error('getTagsFilterServerReal network error:', e);
		throw new RequestError('Ошибка сети', 'NETWORK');
	}

	if (!res.ok) {
		const message = await parseErrorMessage(res, `HTTP ${res.status}`);
		throw new RequestError(message, res.status);
	}

	const data = await res.json();
	if (!Array.isArray(data)) {
		throw new RequestError('Некорректный ответ сервера', 'INVALID_RESPONSE');
	}
	return data as GithubLabelOut[];
}