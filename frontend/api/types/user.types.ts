import { Tenant } from './tenant.types';

export enum TenantRole {
  OWNER = 'OWNER',
  CLIENT = 'CLIENT',
  TEAM = 'TEAM',
}

export interface User {
  id: number;
  tenant_id: number;          // tenant_id → camelCase
  role: TenantRole;
  name: string;
  email: string;
  is_active: boolean;         // is_active → camelCase
  hourly_rate?: number;       // nullable: hourly_rate может отсутствовать
  // поля, которые обычно не отдаются на фронтенд:
  // - password_hash (никогда не передаётся клиенту)
}

// Если на бэкенде есть DTO, который явно включает tenant, можно добавить:
export interface UserWithTenant extends User {
  tenant?: Tenant;
}