import { User } from '@/api/types/user.types';
// TODO: переделать createUserDto в api dto
export function createUserDto(userDto: User) {
	return userDto as User;
}
// TODO: сделать методы create объектов для передачи в бэк

export function createNewUserDto(userDto: Omit<User, 'id'>) {
	return userDto as User;
}