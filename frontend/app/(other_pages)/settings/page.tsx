import getUsersReq from "../api/get_users/get_users.req";
import ChangePasswordTable from "./widgets/ChangePasswordTable";

export default async function SettingsPage() {
  const users = await getUsersReq();
  if (users) {
    return <ChangePasswordTable users={users} />
  } else {
    return <p>Нет доступных пользователей для редактирования</p>;
  }
}
