import { Form, Input, InputNumber, Modal, Select, Switch } from 'antd';
import { IUser, TenantRole } from '@/app/shared/interface/user.interface';
import { useEffect } from 'react';

export default function UserAdditor({
  onCreate,
  onReset,
  isOpen,
}: {
  onCreate: (user: Omit<IUser, 'id'>) => void;
  onReset: () => void;
  isOpen: boolean;
}) {
  const [form] = Form.useForm<Omit<IUser, 'id'>>();

  useEffect(() => {
    if (isOpen) {
      form.resetFields();
    }
  }, [isOpen, form]);

  const closeCreate = () => {
    onReset();
    form.resetFields();
  };

  const handleSave = async () => {
    try {
      const user = await form.validateFields();
      onCreate(user);
      closeCreate();
    } catch {
      // Валидация не прошла — ничего не делаем
    }
  };

  return (
    <Modal
      title="Создание пользователя"
      open={isOpen}
      onOk={handleSave}
      onCancel={closeCreate}
      okText="Создать"
      cancelText="Отмена"
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