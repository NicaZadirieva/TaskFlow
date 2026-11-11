import { TenantRole } from '@/entities/user.interface';

export interface CreateUserRequest {
 login: string; password: string; name: string; email: string; tenant_id: number; role: TenantRole; is_active: boolean; hourly_rate?: number;
}
