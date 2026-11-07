import getServerUsersReq from '@/api/requests/user/get_users/server/get_users.req';
import { ChangePasswordTable } from '@/components/ui/settings';


export default async function ChangePasswordSettingsPage() {
	const { users } = await getServerUsersReq();
	if (users) {
		return <ChangePasswordTable users={users} />;
	} else {
		return <p>Нет доступных пользователей для редактирования</p>;
	}
}
