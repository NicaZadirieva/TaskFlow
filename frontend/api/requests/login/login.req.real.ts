import RequestError from "@/api/utils/error";
import getBackendUrl from "@/utils/getBackendUrl";


export default async function logInReqReal(email: string, password: string): Promise<string> {
	const res = await fetch(`${getBackendUrl()}/user/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email, password }),
	});
	if (!res.ok) {
		const errorData = await res.json().catch(() => ({}));
		throw new RequestError(errorData.detail || 'Invalid credentials', res.status);
	}
	const data = await res.json();
	const token = data.jwt;
	return token;
}