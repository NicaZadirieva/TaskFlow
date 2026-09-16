import { UserRoleEnum } from '@/app/shared/userRoleEnum';
import { IUser } from '../interface/user.interface';

export const usersMockData: IUser[] = [
  {
    key: "1",
    name: "Mike",
    role: UserRoleEnum.CLIENT,
    email: "mike@yandex.ru",
    is_active: true,
  },
  {
    key: "2",
    name: "John",
    role: UserRoleEnum.OWNER,
    email: "john@yandex.ru",
    is_active: true,
    hourly_rate: 12,
  },
  {
    key: "3",
    name: "Nica",
    role: UserRoleEnum.TEAM,
    email: "nica@yandex.ru",
    is_active: true,
    hourly_rate: 13,
  },
];