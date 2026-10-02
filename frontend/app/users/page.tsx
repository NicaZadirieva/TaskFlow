import getUsersReq from '../../api/requests/user/get_users/get_users.req';
import UserTable from '../../components/ui/UserTable/UserTable';


export default async function UsersPage() {
  const users = await getUsersReq();
  if (users) {
      return <UserTable users={users}/>;
  }
}
