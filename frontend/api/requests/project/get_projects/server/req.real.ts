import { cookies } from 'next/headers';
import getBackendUrl from '@/utils/getBackendUrl';
import RequestError from '@/api/utils/error';
import parseErrorMessage from '@/utils/parseErrorMessage';
import type { ProjectSummary } from '../types';

export async function getProjectsServerReal(id?: string): Promise<ProjectSummary[]> {
	const cookieStore = await cookies();
	const cookie = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join('; ');
	const response = await fetch(`${getBackendUrl()}/project${id ? `/${encodeURIComponent(id)}` : ''}`, {
		cache: 'no-store', headers: { Accept: 'application/json', Cookie: cookie }
	});
	if (!response.ok) {
		const message = await parseErrorMessage(response, `${response.status} ${response.statusText}`);
		throw new RequestError(message, response.status);
	}
	const data = await response.json();
	return id ? [data as ProjectSummary] : data as ProjectSummary[];
}
