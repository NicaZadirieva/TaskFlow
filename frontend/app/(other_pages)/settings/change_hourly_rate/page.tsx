import { TenantRole } from '@/api/types/user.types';
import { ChangeHourlyRateForm } from '@/components/ui/settings';
import { IUser } from '@/entities/user.interface';

export default function ChangeHourlyRatePage() {
	const currentUser: IUser = {
		id: 101,
		role: TenantRole.OWNER,
		name: "Анна Демченко",
		email: "anna@taskflow.io",
		is_active: true,
		hourly_rate: 1500, // ₽
	}
	return <ChangeHourlyRateForm currentUser={currentUser} />
}