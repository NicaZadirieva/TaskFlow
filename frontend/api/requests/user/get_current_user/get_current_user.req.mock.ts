
import GetCurrentUserResponse from '@/api/dto/user/get_current_user/GetCurrentUserResponse';
import { TenantRole } from '@/api/types/user.types';

export async function getCurrentUserMock(): Promise<GetCurrentUserResponse> {
	return {
		user_id: 0,
		tenant_id: 0,
		role: 'OWNER' as TenantRole
	};
}