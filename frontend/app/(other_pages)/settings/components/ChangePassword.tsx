"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Card,
  Tag,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { UserRoleEnum } from '@/app/shared/userRoleEnum';

const { Text } = Typography;

interface DataType {
  key: React.Key;
  name: string;
  email: string;
  role: string;
}

const initialDataSource: DataType[] = [
  { key: "1", name: "Mike", role: UserRoleEnum.CLIENT, email: "mike@yandex.ru" },
  { key: "2", name: "John", role: UserRoleEnum.OWNER, email: "john@yandex.ru" },
  { key: "3", name: "Nica", role: UserRoleEnum.TEAM, email: "nica@yandex.ru" },
];

interface PasswordFormValues {
  password: string;
  confirm: string;
}

export default function ChangePasswordTable() {
  const [dataSource] = useState<DataType[]>(initialDataSource);
  const [selectedKey, setSelectedKey] = useState<React.Key | null>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [form] = Form.useForm<PasswordFormValues>();

  const selectedUser = dataSource.find((u) => u.key === selectedKey) ?? null;

  // Сбрасываем поля, когда модалка открылась (форма уже смонтирована)
  useEffect(() => {
    if (passwordModalOpen) {
      form.resetFields();
    }
  }, [passwordModalOpen, form]);

  const openPasswordModal = () => {
    if (!selectedUser) return;
    setPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    setPasswordModalOpen(false);
  };

  const handleChangePassword = async () => {
    try {
      const values = await form.validateFields();
      // await api.changePassword(selectedUser.email, values.password);
      console.log("Смена пароля для", selectedUser?.email, values.password);
      message.success(`Пароль для «${selectedUser?.name}» изменён`);
      closePasswordModal();
    } catch {
      // Ошибки валидации уже подсвечены под полями
    }
  };

  const columns: ColumnsType<DataType> = [
    { title: "Имя", dataIndex: "name", key: "name" },
    { title: "Роль", dataIndex: "role", key: "role" },
    { title: "Email", dataIndex: "email", key: "email" },
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

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Button type="primary" disabled={!selectedUser} onClick={openPasswordModal}>
          Изменить пароль
          {selectedUser ? ` (${selectedUser.name})` : ""}
        </Button>
      </div>

      <div className="user-table-desktop">
        <Table<DataType>
          dataSource={dataSource}
          columns={columns}
          rowKey="key"
          onRow={(record) => ({
            onClick: () => setSelectedKey(record.key),
            style: { cursor: "pointer" },
          })}
        />
      </div>

      <div className="user-table-mobile">
        {dataSource.map((item) => {
          const isSelected = item.key === selectedKey;
          return (
            <Card
              key={item.key}
              size="small"
              style={{
                marginBottom: 12,
                borderColor: isSelected ? "#1677ff" : undefined,
                borderWidth: isSelected ? 2 : 1,
              }}
              styles={{ body: { padding: 12 } }}
              onClick={() => setSelectedKey(item.key)}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Text strong style={{ fontSize: 16 }}>{item.name}</Text>
                  <Tag color="blue">{item.role}</Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 13 }}>{item.email}</Text>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        title={selectedUser ? `Смена пароля — ${selectedUser.name}` : "Смена пароля"}
        open={passwordModalOpen}
        onOk={handleChangePassword}
        onCancel={closePasswordModal}
        okText="Сохранить"
        cancelText="Отмена"
        // destroyOnHidden убран — форма всегда смонтирована
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Новый пароль"
            name="password"
            rules={[
              { required: true, message: "Введите новый пароль" },
              { min: 6, message: "Минимум 6 символов" },
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Введите новый пароль" />
          </Form.Item>

          <Form.Item
            label="Подтверждение пароля"
            name="confirm"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Повторите пароль" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Пароли не совпадают"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Повторите пароль" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}