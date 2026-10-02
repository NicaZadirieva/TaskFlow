import { User } from '@/api/types/user.types';

export default async function changeUserReqMock(userId: number, newUser: User) {
	return Promise.resolve();
}