"use client";

import { useState } from "react";
import {
  Badge,
  Table,
  Card,
  Tag,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { UserRoleEnum } from '@/app/shared/userRoleEnum';


const { Text } = Typography;

interface DataType {
  key: React.Key;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  hourly_rate?: number;
}

const initialDataSource: DataType[] = [
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
  const [dataSource, setDataSource] = useState<DataType[]>(initialDataSource);
  const [editingRecord, setEditingRecord] = useState<DataType | null>(null);
  const [form] = Form.useForm<DataType>();

  const openEdit = (record: DataType) => {
  setEditingRecord(record);
  // Откладываем установку значений до монтирования содержимого Modal
  queueMicrotask(() => {
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      role: record.role,
      is_active: record.is_active,
      hourly_rate: record.hourly_rate,
    });
  });
};

  const closeEdit = () => {
    setEditingRecord(null);
    form.resetFields();
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // Если роль — клиент, сбрасываем стоимость часа
      const normalized: Partial<DataType> =
        values.role === UserRoleEnum.CLIENT
          ? { ...values, hourly_rate: undefined }
          : values;

      setDataSource((prev) =>
        prev.map((item) =>
          item.key === editingRecord?.key ? { ...item, ...normalized } : item,
        ),
      );
      closeEdit();
    } catch {
      // Валидация не прошла — ничего не делаем
    }
  };

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
    {
      title: "Редактировать",
      key: "edit",
      render: (_, record) => (
        <Button type="link" onClick={() => openEdit(record)}>
          Изменить
        </Button>
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

              <Button
                type="link"
                style={{ padding: 0, alignSelf: "flex-start", marginTop: 4 }}
                onClick={() => openEdit(item)}
              >
                Редактировать
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Модальное окно редактирования 
	  TODO: доступно только OWNER*/}
      <Modal
        title="Редактирование пользователя"
        open={!!editingRecord}
        onOk={handleSave}
        onCancel={closeEdit}
        okText="Сохранить"
        cancelText="Отмена"
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          preserve={false}
          // key заставляет форму пересоздаваться при смене редактируемой записи,
          // чтобы initialValues гарантированно применились
          key={String(editingRecord?.key ?? "new")}
          initialValues={
            editingRecord
              ? {
                  name: editingRecord.name,
                  email: editingRecord.email,
                  role: editingRecord.role,
                  is_active: editingRecord.is_active,
                  hourly_rate: editingRecord.hourly_rate,
                }
              : undefined
          }
        >
          <Form.Item
            label="Имя"
            name="name"
            rules={[{ required: true, message: "Введите имя" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Введите email" },
              { type: "email", message: "Некорректный email" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Роль"
            name="role"
            rules={[{ required: true, message: "Выберите роль" }]}
          >
            <Select
              options={[
                { value: UserRoleEnum.CLIENT, label: UserRoleEnum.CLIENT },
                { value: UserRoleEnum.OWNER, label: UserRoleEnum.OWNER },
                { value: UserRoleEnum.TEAM, label: UserRoleEnum.TEAM },
              ]}
            />
          </Form.Item>

          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) =>
              getFieldValue("role") !== UserRoleEnum.CLIENT ? (
                <Form.Item label="Стоимость в час ₽/ч" name="hourly_rate">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item label="Активен" name="is_active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}