import type GithubLabelOut from '@/api/dto/github_label/get_all/GithubLabelOut';
import RequestError from '@/api/utils/error';
import getBackendUrl from '@/utils/getBackendUrl';
import parseErrorMessage from '@/utils/parseErrorMessage';

export default async function getTagsFiltersClientRealReq(): Promise<GithubLabelOut[]> {
	let res: Response;

	try {
		res = await fetch(`${getBackendUrl()}/task/filters/tags`, {
			method: 'GET',
			credentials: 'include',
			headers: { Accept: 'application/json' }
		});
	} catch (e) {
		console.error('getTagsFiltersClientRealReq network error:', e);
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