import { User } from '@/api/types/user.types';
import { IUser } from '@/entities/user.interface';

export function toUserSchema(userDto: IUser) {
	return userDto as User;
}
// TODO: сделать методы create объектов для передачи в бэк

export function toNewUserSchema(userDto: Omit<IUser, 'id'>) {
	return userDto as User;
}