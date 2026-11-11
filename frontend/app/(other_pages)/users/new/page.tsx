import { UserCreator } from '@/components/ui/user';
import getCurrentUserServerReq from '@/api/requests/user/get_current_user/server/get_current_user.req';
import { TenantRole } from '@/api/types/user.types';
import { Result } from 'antd';

export default async function UserNewPage() {
	const user = await getCurrentUserServerReq();
	if (user.role !== TenantRole.OWNER) return <Result status="403" title="Доступ запрещён" />;
	return <UserCreator tenantId={user.tenant_id} />;
}
