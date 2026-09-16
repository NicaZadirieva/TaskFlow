import { Form, Input, InputNumber, Modal, Select, Switch } from 'antd';
import { IUser } from '../../../interface/user.interface';
import { useEffect } from 'react';
import { UserRoleEnum } from '@/app/shared/userRoleEnum';

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
	)
}
