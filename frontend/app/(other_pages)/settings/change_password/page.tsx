import getUsersReq from "../../../api/requests/user/get_users/get_users.req";
import ChangePasswordTable from './widgets/ChangePasswordTable';


export default async function ChangePasswordSettingsPage() {
  const users = await getUsersReq();
  if (users) {
    return <ChangePasswordTable users={users} />
  } else {
    return <p>Нет доступных пользователей для редактирования</p>;
  }
}
