export enum TenantRole {
  OWNER = 'OWNER',
  CLIENT = 'CLIENT',
  TEAM = 'TEAM',
}


export interface User {
  id: number;
  name: string;
  email: string;
  role: TenantRole;
  is_active: boolean;
  hourly_rate?: number;
}