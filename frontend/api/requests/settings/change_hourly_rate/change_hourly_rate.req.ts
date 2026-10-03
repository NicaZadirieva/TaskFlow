import { User } from '@/api/types/user.types';
import isMockEnabled from '@/utils/isMockEnabled';
import changeHourlyRateReqMock from './change_hourly_rate.req.mock';
import changeHourlyRateReqReal from './change_hourly_rate.req.real';

export default async function changeHourlyRateReq(user: User, hourly_rate: number) {
	if (isMockEnabled()) {
		return await changeHourlyRateReqMock(user, hourly_rate);
	}
	return await changeHourlyRateReqReal(user, hourly_rate);
}