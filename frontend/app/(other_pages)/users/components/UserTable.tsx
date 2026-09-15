"use client";

import { Badge, Table } from "antd";
import { UserRoleEnum } from '../userRoleEnum';
const { Column, ColumnGroup } = Table;

interface DataType {
  key: React.Key;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  hourly_rate?: number;
}
export default function UserTable() {
  const dataSource: DataType[] = [
    {
      key: "1",
      name: "Mike",
      role: UserRoleEnum.CLIENT,
      email: "mike@yandex.ru",
	  is_active: true
    },
    {
      key: "2",
      name: "John",
      role: UserRoleEnum.OWNER,
      email: "john@yandex.ru",
	  is_active: true,
	  hourly_rate: 12
    },
	{
      key: "3",
      name: "Nica",
      role: UserRoleEnum.TEAM,
      email: "nica@yandex.ru",
	  is_active: true,
	  hourly_rate: 13
    },
  ];


  return (
  <Table<DataType> dataSource={dataSource}>
	 <Column title="Имя" dataIndex="name" key="name" />
	 <Column title="Email" dataIndex="email" key="email" />
	 <Column title="Роль" dataIndex="role" key="role" />
	 <Column
      title="Активен"
      key="is_active"
      render={(_: any, record: DataType) => {
		if (record.is_active) {
			return <Badge status="success" text="Активен" />
		} else {
			return <Badge status="error" text="Не активен" />
		}
	  }}
    />
	<Column title="Стоимость в час" dataIndex="hourly_rate" key="hourly_rate" render={(_: any, record: DataType) => {
		if (record.role == UserRoleEnum.CLIENT) {
			return <Badge status="warning" text="Клиент не имеет" />
		} else {
			return record.hourly_rate
		}
	  }}/>
	</Table>)
}
