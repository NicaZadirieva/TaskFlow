import getBackendUrl from '@/utils/getBackendUrl';
import RequestError from '@/api/utils/error';
import parseErrorMessage from '@/utils/parseErrorMessage';
import type { ProjectSummary } from '../types';

export async function getProjectsClientReal(id?: string): Promise<ProjectSummary[]> {
	const response = await fetch(`${getBackendUrl()}/project${id ? `/${encodeURIComponent(id)}` : ''}`, {
		cache: 'no-store', credentials: 'include', headers: { Accept: 'application/json' }
	});
	if (!response.ok) throw new RequestError(await parseErrorMessage(response, response.statusText), response.status);
	const data = await response.json();
	return id ? [data as ProjectSummary] : data as ProjectSummary[];
}
