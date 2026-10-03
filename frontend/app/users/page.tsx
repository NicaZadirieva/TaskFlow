import { getUsersReq } from '@/api/requests';
import { UserTable } from '@/components/ui/user';


export default async function UsersPage() {
  const users = await getUsersReq();
  if (users) {
      return <UserTable users={users}/>;
  }
}
