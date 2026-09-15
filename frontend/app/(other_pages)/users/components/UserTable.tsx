"use client";

import { Badge, Table, Card, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { UserRoleEnum } from "../userRoleEnum";

const { Text } = Typography;

interface DataType {
  key: React.Key;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  hourly_rate?: number;
}

const dataSource: DataType[] = [
  {
    key: "1",
    name: "Mike",
    role: UserRoleEnum.CLIENT,
    email: "mike@yandex.ru",
    is_active: true,
  },
  {
    key: "2",
    name: "John",
    role: UserRoleEnum.OWNER,
    email: "john@yandex.ru",
    is_active: true,
    hourly_rate: 12,
  },
  {
    key: "3",
    name: "Nica",
    role: UserRoleEnum.TEAM,
    email: "nica@yandex.ru",
    is_active: true,
    hourly_rate: 13,
  },
];

const renderActive = (record: DataType) =>
  record.is_active ? (
    <Badge status="success" text="Активен" />
  ) : (
    <Badge status="error" text="Не активен" />
  );

export default function UserTable() {
  const columns: ColumnsType<DataType> = [
    { title: "Имя", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Роль", dataIndex: "role", key: "role" },
    {
      title: "Активен",
      key: "is_active",
      render: (_, record) => renderActive(record),
    },
    {
      title: "Стоимость в час",
      dataIndex: "hourly_rate",
      key: "hourly_rate",
      render: (_, record) =>
        record.role === UserRoleEnum.CLIENT ? (
          <Badge status="warning" text="Клиент не имеет" />
        ) : (
          <>{record.hourly_rate ?? "—"}</>
        ),
    },
  ];

  return (
    <>
      <style>{`
        .user-table-desktop { display: none; }
        .user-table-mobile { display: block; }
        @media (min-width: 576px) {
          .user-table-desktop { display: block; }
          .user-table-mobile { display: none; }
        }
      `}</style>

      {/* Десктоп — таблица */}
      <div className="user-table-desktop">
        <Table<DataType>
          dataSource={dataSource}
          columns={columns}
          rowKey="key"
        />
      </div>

      {/* Мобилка — карточки */}
      <div className="user-table-mobile">
        {dataSource.map((item) => (
          <Card
            key={item.key}
            size="small"
            style={{ marginBottom: 12 }}
            styles={{ body: { padding: 12 } }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Text strong style={{ fontSize: 16 }}>
                  {item.name}
                </Text>
                {renderActive(item)}
              </div>

              <Text type="secondary" style={{ fontSize: 13 }}>
                {item.email}
              </Text>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 4,
                }}
              >
                <Tag color="blue">{item.role}</Tag>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {item.role === UserRoleEnum.CLIENT
                    ? "Клиент не имеет"
                    : `${item.hourly_rate ?? "—"} ₽/ч`}
                </Text>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}