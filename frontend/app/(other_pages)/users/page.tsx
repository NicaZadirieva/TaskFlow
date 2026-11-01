import getServerUsersReq from '@/api/requests/user/get_users/server/get_users.req';
import { UserTable } from '@/components/ui/user';


export default async function UsersPage() {
	const dto = await getServerUsersReq();
	if (dto) {
		// TODO: перевести dto в entities
		return <UserTable users={dto.users}/>;
	}
}
