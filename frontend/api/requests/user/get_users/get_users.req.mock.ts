import { TenantRole, User } from '@/api/types/user.types';
import { IUser } from '@/entities/user.interface';

const mockUsers: User[] = [
  {
    id: 101,
    tenant_id: 5,
    role: TenantRole.OWNER,
    name: "Анна Демченко",
    email: "anna@taskflow.io",
    is_active: true,
    hourly_rate: 1500, // ₽
  },
  {
    id: 203,
    tenant_id: 5,
    role: TenantRole.CLIENT,
    name: "Иван Петров",
    email: "ivan.petrov@client-company.com",
    is_active: true,
    // hourlyRate отсутствует — клиенты не работают по часам
  },
  {
    id: 317,
    tenant_id: 5,
    role: TenantRole.TEAM,
    name: "Сергей Волков",
    email: "sergey@taskflow.io",
    is_active: true,
    hourly_rate: 1200,
  },
];


export default async function getUsersReqMock(): Promise<IUser[]> {
	return mockUsers;
}