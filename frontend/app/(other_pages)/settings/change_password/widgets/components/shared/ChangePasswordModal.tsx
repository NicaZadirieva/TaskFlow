import { IUser } from "@/app/shared/interface/user.interface";
import { Form, Input, message, Modal } from "antd";

import { toUserSchema } from "@/app/api/mappers/to_schema/to_user";
import changePasswordReq from '@/app/(other_pages)/settings/api/change_password.req';

interface PasswordFormValues {
  password: string;
  confirm: string;
}
export default function ChangePasswordModel({
  selectedUser,
  hideModal,
  isOpen = false,
}: {
  selectedUser: IUser | null;
  hideModal: () => void;
  isOpen: boolean;
}) {
  const [form] = Form.useForm<PasswordFormValues>();

  const closePasswordModal = () => {
    form.resetFields();
    hideModal();
  };

  const handleChangePassword = async () => {
    try {
      if (selectedUser) {
        const values = await form.validateFields();
        await changePasswordReq(toUserSchema(selectedUser), values.password);
        message.success(`Пароль для «${selectedUser?.name}» изменён`);
        closePasswordModal();
      } else {
        console.error("Пользователь для смены пароля не выбран");
        message.error("Пользователь не выбран");
      }
    } catch (e) {
      console.error("Ошибка обновления", e);
      message.error("Ошибка обновления");
    }
  };

  return (
    <Modal
      title={
        selectedUser ? `Смена пароля — ${selectedUser.name}` : "Смена пароля"
      }
      open={isOpen}
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
  );
}
