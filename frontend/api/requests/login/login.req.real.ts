import RequestError from "@/api/utils/error";
import getBackendUrl from "@/utils/getBackendUrl";
import parseErrorMessage from "@/utils/parseErrorMessage";


export default async function logInReqReal(email: string, password: string): Promise<string> {
	const res = await fetch(`${getBackendUrl()}/user/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email, password }),
	});
	if (!res.ok) {
		const message = await parseErrorMessage(res, 'Invalid credentials');
		throw new RequestError(message, res.status);
	}
	const data = await res.json();
	const token = data.jwt;
	return token;
}