import { TenantRole } from '@/api/types/user.types';

export default interface GetCurrentUserResponse {
	user_id: number;
	role: TenantRole;
	tenant_id: number;
}