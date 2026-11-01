
import GetCurrentUserResponse from '@/api/dto/user/get_current_user/GetCurrentUserResponse';
import getBackendUrl from '@/utils/getBackendUrl';

export async function getCurrentUserRealClient(): Promise<GetCurrentUserResponse> {
	const res = await fetch(`${getBackendUrl()}/user/current`, {
		method: 'GET',
		credentials: 'include',
		headers: { Accept: 'application/json' }
	});

	if (!res.ok) {
		throw new Error(`[getCurrentUserClient] HTTP ${res.status}`);
	}

	return (await res.json());
}