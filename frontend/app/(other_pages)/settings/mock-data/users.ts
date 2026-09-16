import { IUser } from '@/app/shared/interface/user.interface';
import { UserRoleEnum } from '@/app/shared/userRoleEnum';

export const users: Omit<IUser, 'is_active' | 'hourly_rate'>[] = [
  { key: "1", name: "Mike", role: UserRoleEnum.CLIENT, email: "mike@yandex.ru" },
  { key: "2", name: "John", role: UserRoleEnum.OWNER, email: "john@yandex.ru" },
  { key: "3", name: "Nica", role: UserRoleEnum.TEAM, email: "nica@yandex.ru" },
];