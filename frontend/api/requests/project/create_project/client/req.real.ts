import RequestError from '@/api/utils/error';
import getBackendUrl from '@/utils/getBackendUrl';
import parseErrorMessage from '@/utils/parseErrorMessage';
import type { CreateProjectRequest, CreateProjectResponse } from '../types';

export async function createProjectClientReal(data: CreateProjectRequest): Promise<CreateProjectResponse> {
	const response = await fetch(`${getBackendUrl()}/project/create`, {
		method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data)
	});
	if (!response.ok) throw new RequestError(await parseErrorMessage(response, response.statusText), response.status);
	return await response.json() as CreateProjectResponse;
}
