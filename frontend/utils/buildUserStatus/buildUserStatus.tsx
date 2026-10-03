import { Badge } from 'antd';
import { IUser } from '../../entities/user.interface';

export const buildUserStatus = (record: IUser) =>
  record.is_active ? (
    <Badge status="success" text="Активен" />
  ) : (
    <Badge status="error" text="Не активен" />
  );