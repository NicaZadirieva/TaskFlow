import { IUser } from '@/app/shared/interface/user.interface';
import { User } from '@/app/shared/schema/user.types';

export function toUserSchema(userDto: IUser) {
	return userDto as User;
}

export function toNewUserSchema(userDto: Omit<IUser, 'id'>) {
	return userDto as User;
}