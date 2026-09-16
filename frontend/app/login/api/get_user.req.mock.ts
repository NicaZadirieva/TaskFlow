import { TenantRole, User } from "@/app/shared/schema/user.types";

const mockOwner: User = {
  id: 101,
  tenantId: 5,
  role: TenantRole.OWNER,
  name: "Анна Демченко",
  email: "anna@taskflow.io",
  isActive: true,
  hourlyRate: 1500, // ₽
};

const mockClient: User = {
  id: 203,
  tenantId: 5,
  role: TenantRole.CLIENT,
  name: "Иван Петров",
  email: "ivan.petrov@client-company.com",
  isActive: true,
  // hourlyRate отсутствует — клиенты не работают по часам
};

const mockTeamMember: User = {
  id: 317,
  tenantId: 5,
  role: TenantRole.TEAM,
  name: "Сергей Волков",
  email: "sergey@taskflow.io",
  isActive: true,
  hourlyRate: 1200,
};

export default async function getUserReqMock(email: string, password: string) {
  //return mockOwner;
  return Promise.reject("Данный пользователь не зарегестрирован. Обратитесь к администратору");
}
