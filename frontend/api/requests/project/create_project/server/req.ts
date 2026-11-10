import { cookies } from 'next/headers';
import RequestError from '@/api/utils/error';
import getBackendUrl from '@/utils/getBackendUrl';
import isMockEnabled from '@/utils/isMockEnabled';
import parseErrorMessage from '@/utils/parseErrorMessage';
import createProjectMock from '../req.mock';
import type { CreateProjectRequest, CreateProjectResponse } from '../types';

export default async function createProjectServerReq(data: CreateProjectRequest): Promise<CreateProjectResponse> {
	if (isMockEnabled()) return createProjectMock();
	const cookie = (await cookies()).getAll().map((item) => `${item.name}=${item.value}`).join('; ');
	const response = await fetch(`${getBackendUrl()}/project/create`, {
		method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', Cookie: cookie }, body: JSON.stringify(data)
	});
	if (!response.ok) throw new RequestError(await parseErrorMessage(response, response.statusText), response.status);
	return await response.json() as CreateProjectResponse;
}

