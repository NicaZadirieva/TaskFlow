import GetCurrentUserResponse from '@/api/dto/user/get_current_user/GetCurrentUserResponse';
import getBackendUrl from '@/utils/getBackendUrl';
import { cookies } from 'next/headers';

export async function getCurrentUserRealServer(): Promise<GetCurrentUserResponse> {
	const url = `${getBackendUrl()}/user/current`;

	const cookieStore = await cookies();

	const res = await fetch(url, {
		method: 'GET',
		cache: 'no-store',
		headers: {
			Accept: 'application/json',
			Cookie: cookieStore.toString()
		}
	});

	if (!res.ok) {
		const text = await res.text().catch(() => '');
		throw new Error(
			`[getCurrentUserRealServer] ${res.status} ${res.statusText}${text ? ` — ${text}` : ''}`
		);
	}

	return await res.json();
}
