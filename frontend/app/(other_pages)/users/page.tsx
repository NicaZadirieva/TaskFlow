import getUsersReq from '../api/get_users/get_users.req';
import UserTable from "./widgets/UserTable";

export default async function UsersPage() {
  const users = await getUsersReq();
  if (users) {
      return <UserTable users={users}/>;
  }
}
