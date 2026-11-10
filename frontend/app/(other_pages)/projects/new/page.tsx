import { TenantRole } from '@/api/types/user.types';
import getCurrentUserServerReq from '@/api/requests/user/get_current_user/server/get_current_user.req';
import getServerUsersReq from '@/api/requests/user/get_users/server/get_users.req';
import { Result } from 'antd';
import ProjectCreator from '@/components/ui/project/widgets/ProjectCreator';

export default async function CreateProjectPage() {
	const user = await getCurrentUserServerReq();
	if (user.role !== TenantRole.OWNER) return <Result status="403" title="Доступ запрещён" subTitle="Создавать проекты может только владелец." />;
	const { users } = await getServerUsersReq();
	const clients = users.filter((item) => item.role === TenantRole.CLIENT && item.is_active).map(({ id, name, email }) => ({ value: id, label: `${name} (${email})` }));
	return <ProjectCreator clients={clients} />;
}
