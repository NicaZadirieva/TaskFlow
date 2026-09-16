import { Badge } from 'antd';
import { IUser } from '../interface/user.interface';

export const renderActive = (record: IUser) =>
  record.is_active ? (
    <Badge status="success" text="Активен" />
  ) : (
    <Badge status="error" text="Не активен" />
  );