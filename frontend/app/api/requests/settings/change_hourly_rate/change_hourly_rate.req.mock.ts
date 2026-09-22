import { User } from '@/app/shared/schema/user.types';

export default async function changeHourlyRateReqMock(user: User, hourly_rate: number) {
	return Promise.resolve({success: true});
}