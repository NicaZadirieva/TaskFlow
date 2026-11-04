import type GithubLabel from '@/api/types/github-label.types';
import RequestError from '@/api/utils/error';
import getBackendUrl from '@/utils/getBackendUrl';
import parseErrorMessage from '@/utils/parseErrorMessage';
import { cookies } from 'next/headers';
import GithubLabelListOut from '@/api/dto/github_label/get_all/GithubLabelListOut';

function buildCookieHeader(
	cookieStore: Awaited<ReturnType<typeof cookies>>
): string {
	return cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join('; ');
}

export default async function getAllGithubLabelsReq(): Promise<GithubLabel[]> {
	const cookieStore = await cookies();
	const cookieHeader = buildCookieHeader(cookieStore);

	let res: Response;

	try {
		res = await fetch(`${getBackendUrl()}/tag/all`, {
			method: 'GET',
			headers: cookieHeader ? { Cookie: cookieHeader } : {},
			cache: 'no-store'
		});
	} catch (e) {
		console.error('getAllGithubLabelsReq network error:', e);
		throw new RequestError('Ошибка сети', 'NETWORK');
	}

	if (!res.ok) {
		const message = await parseErrorMessage(res);
		throw new RequestError(message, res.status);
	}

	const data: GithubLabelListOut = await res.json();
	return data.items ?? [];
}