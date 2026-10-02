import { User } from '@/api/types/user.types';

export default async function changeHourlyRateReqMock(user: User, hourly_rate: number) {
	return Promise.resolve({success: true});
}