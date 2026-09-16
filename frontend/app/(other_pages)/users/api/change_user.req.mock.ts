import { User } from '@/app/shared/schema/user.types';

export default async function changeUserReqMock(userId: number, newUser: User) {
	return Promise.resolve();
}