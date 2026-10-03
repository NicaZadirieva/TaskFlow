"use client";
import { createNewUserDto } from "@/api/mappers";
import { IUser, TenantRole } from "@/entities/user.interface";
import { Form, Input, InputNumber, message, Modal, Select, Switch } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import createUserReq from "../../../../../api/requests/user/create_user/create_user.req";

export default function UserAdditor() {
  const [form] = Form.useForm<Omit<IUser, "id">>();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    setIsOpen(true);
  }, []);
  const onCreate = async (user: Omit<IUser, "id">) => {
    const normalized =
      user.role === TenantRole.CLIENT
        ? { ...user, hourly_rate: undefined }
        : user;

    try {
      await createUserReq(createNewUserDto(normalized));
      router.push("/users");
      message.success("Обновление данных прошло успешно");
    } catch (e) {
      console.error("Ошибка создания", e);
      message.error("Ошибка создания пользователя");
    }
  };

  const handleSave = async () => {
    try {
      const user = await form.validateFields();
      onCreate(user);
    } catch {
      // Валидация не прошла — ничего не делаем
    }
  };

  return (
    <Modal
      title="Создание пользователя"
      open={isOpen}
      onOk={handleSave}
      okText="Создать"
      cancelText="Отмена"
      onCancel={() => router.back()}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
        initialValues={{
          role: TenantRole.TEAM,
          is_active: true,
        }}
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
              { value: TenantRole.CLIENT, label: TenantRole.CLIENT },
              { value: TenantRole.OWNER, label: TenantRole.OWNER },
              { value: TenantRole.TEAM, label: TenantRole.TEAM },
            ]}
          />
        </Form.Item>

        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) =>
            getFieldValue("role") !== TenantRole.CLIENT ? (
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
  );
}
