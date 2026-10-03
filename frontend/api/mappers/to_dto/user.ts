import { User } from '@/api/types/user.types';
import { IUser } from '@/entities/user.interface';

export function createUserDto(userDto: IUser) {
	return userDto as User;
}
// TODO: сделать методы create объектов для передачи в бэк

export function createNewUserDto(userDto: Omit<IUser, 'id'>) {
	return userDto as User;
}