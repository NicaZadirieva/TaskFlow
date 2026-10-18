import { TenantRole } from "@/api/types/user.types";

export default interface UserDto {
    id: number;
    login: string;
    tenant_id: number;
    role: TenantRole;
    name: string;
    email: string;
    is_active: boolean;
    hourly_rate?: number;
}