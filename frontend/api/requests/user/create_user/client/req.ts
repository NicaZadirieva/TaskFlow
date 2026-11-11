import isMockEnabled from '@/utils/isMockEnabled';
import getBackendUrl from '@/utils/getBackendUrl';
import parseErrorMessage from '@/utils/parseErrorMessage';
import RequestError from '@/api/utils/error';
import type { CreateUserRequest } from '../types';

export default async function createUserReq(data: CreateUserRequest) {
	if (isMockEnabled()) return;
	const response = await fetch(`${getBackendUrl()}/user/create`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
	if (!response.ok) throw new RequestError(await parseErrorMessage(response, response.statusText), response.status);
}
