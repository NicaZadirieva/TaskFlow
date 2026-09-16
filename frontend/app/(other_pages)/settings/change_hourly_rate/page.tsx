import { TenantRole, User } from '@/app/shared/schema/user.types';
import ChangeHourlyRate from './ChangeHourlyForm';
import { IUser } from '@/app/shared/interface/user.interface';

export default function ChangeHourlyRatePage() {
	const currentUser: IUser = {
		id: 101,
		role: TenantRole.OWNER,
		name: "Анна Демченко",
		email: "anna@taskflow.io",
		is_active: true,
		hourly_rate: 1500, // ₽
	}
	return <ChangeHourlyRate currentUser={currentUser} />
}