import { Badge } from 'antd';
import { User } from '../../entities/user.interface';

// TODO: проверить может лучше в component/shared
export const buildUserStatus = (record: User) =>
  record.is_active ? (
    <Badge status="success" text="Активен" />
  ) : (
    <Badge status="error" text="Не активен" />
  );