import getServerUsersReq from '@/api/requests/user/get_users/server/get_users.req';
import getCurrentUserServerReq from '@/api/requests/user/get_current_user/server/get_current_user.req';
import { TenantRole } from '@/api/types/user.types';
import { UserTable } from '@/components/ui/user';


export default async function UsersPage() {
	const [dto, currentUser] = await Promise.all([getServerUsersReq(), getCurrentUserServerReq()]);
	if (dto) {
		// TODO: перевести dto в entities
		return <UserTable users={dto.users} canEdit={currentUser.role === TenantRole.OWNER}/>;
	}
}
