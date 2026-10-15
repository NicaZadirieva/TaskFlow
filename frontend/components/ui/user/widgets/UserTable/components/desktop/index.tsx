"use client";

import { TenantRole, User } from "@/entities/user.interface";
import { buildUserStatus } from "@/utils/buildUserStatus/buildUserStatus";
import { Badge, Button, Table } from "antd";



const { Column } = Table;



export default function DesktopUserTable({
  onEdit,
  dataSource
}: {
  onEdit: (record: User) => void;
  dataSource: User[]
}) {
  return (
    <div className="user-table-desktop">
      <Table<User> dataSource={dataSource} rowKey="id">
        <Column title="Имя" key="name" dataIndex="name" />
        <Column title="Email" key="email" dataIndex="email" />
        <Column title="Роль" key="role" dataIndex="role" />
        <Column
          title="Активен"
          key="is_active"
          render={(_, record: User) => buildUserStatus(record)}
        />
        <Column
          title="Стоимость в час"
          key="hourly_rate"
          render={(_, record) =>
            record.role === TenantRole.CLIENT ? (
              <Badge status="warning" text="Клиент не имеет" />
            ) : (
              <>{record.hourly_rate ?? "—"}</>
            )
          }
        />
        <Column
          title="Редактировать"
          key="edit"
          render={(_, record: User) => (
            <Button type="link" onClick={() => onEdit(record)}>
              Изменить
            </Button>
          )}
        />
      </Table>
    </div>
  );
}
