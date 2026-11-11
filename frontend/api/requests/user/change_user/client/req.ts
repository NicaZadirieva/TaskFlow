import isMockEnabled from '@/utils/isMockEnabled';
import getBackendUrl from '@/utils/getBackendUrl';
import parseErrorMessage from '@/utils/parseErrorMessage';
import RequestError from '@/api/utils/error';
import type { User } from '@/api/types/user.types';

export default async function changeUserReq(id: number, user: User) {
	if (isMockEnabled()) return;
	const response = await fetch(`${getBackendUrl()}/user/${id}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(user) });
	if (!response.ok) throw new RequestError(await parseErrorMessage(response, response.statusText), response.status);
}
