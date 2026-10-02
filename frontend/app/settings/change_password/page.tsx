import { getUsersReq } from "@/api/requests";
import { ChangePasswordTable } from '@/components/ui/settings';


export default async function ChangePasswordSettingsPage() {
  const users = await getUsersReq();
  if (users) {
    return <ChangePasswordTable users={users} />
  } else {
    return <p>Нет доступных пользователей для редактирования</p>;
  }
}
