import { User } from "@/api/types/user.types";
import RequestError from "@/api/utils/error";
import getBackendUrl from "@/utils/getBackendUrl";
import parseErrorMessage from "@/utils/parseErrorMessage";


export interface UserOutList {
	users: User[];
}

export default async function getUsersReqReal() {
	const res = await fetch(`${getBackendUrl()}/user/users`, {
		method: 'GET',
		credentials: "include",
		headers: {
			'Content-Type': 'application/json',
		},
	});

	if (!res.ok) {
		const message = await parseErrorMessage(res, 'Invalid credentials');
		throw new RequestError(message, res.status);
	}

	const data: UserOutList = await res.json();
	return data.users;
}
