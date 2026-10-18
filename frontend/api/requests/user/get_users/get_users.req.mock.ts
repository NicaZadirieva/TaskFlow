import GetUsersResponse from '@/api/dto/user/get_users/GetUsersResponse';
import UserDto from '@/api/dto/user/get_users/UserDto';
import { TenantRole } from '@/api/types/user.types';

const mockUsers: UserDto[] = [
  {
    id: 101,
    tenant_id: 5,
    role: TenantRole.OWNER,
    name: "Анна Демченко",
    email: "anna@taskflow.io",
    is_active: true,
    hourly_rate: 1500, // ₽
    login: "login"
  },
  {
    login: "login2",
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
    login: "login3"
  },
];


export default async function getUsersReqMock(): Promise<GetUsersResponse> {
	return {users: mockUsers};
}