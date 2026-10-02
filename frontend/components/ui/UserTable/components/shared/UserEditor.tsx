import { IUser, TenantRole } from '@/entities/user.interface';
import { Form, Input, InputNumber, Modal, Select, Switch } from 'antd';
import { useEffect } from 'react';


export default function UserEditor({onSave, onReset, editingRecord = null}: {onSave: (user: IUser) => void, editingRecord: IUser| null, onReset: () => void}) {
  const [form] = Form.useForm<IUser>();

  useEffect(() => {
	if (editingRecord) {
		form.setFieldsValue({
        name: editingRecord.name,
        email: editingRecord.email,
        role: editingRecord.role,
        is_active: editingRecord.is_active,
        hourly_rate: editingRecord.hourly_rate,
      });
	}
	
  }, [editingRecord]);

  const closeEdit = () => {
    onReset();
    form.resetFields();
  };

  

  const handleSave = async () => {
    try {
      const user = await form.validateFields();
      onSave(user);
      closeEdit();
    } catch {
      // Валидация не прошла — ничего не делаем
    }
  };

	return (
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
          key={String(editingRecord?.id ?? "new")}
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
	)
}
