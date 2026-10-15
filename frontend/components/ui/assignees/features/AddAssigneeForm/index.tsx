"use client";

import { PlusOutlined } from "@ant-design/icons";
import { Form, Input, InputNumber, message, Modal, Select, Space } from "antd";
import { useMemo } from "react";

import { Executor } from "@/entities/executor.interface";
import { User } from "@/entities/user.interface";
import styles from "./index.module.css";

interface AddFormValues {
  userId: User["id"];
  role: string;
  customRole?: string;
  hours?: number;
  planned?: number;
  hourly_rate_from_admin: number;
}

const ROLE_OPTIONS = [
  { value: "Frontend", label: "Frontend" },
  { value: "Backend", label: "Backend" },
  { value: "DevOps", label: "DevOps" },
  { value: "Tech Lead", label: "Tech Lead" },
  { value: "QA", label: "QA" },
  { value: "Designer", label: "Designer" },
  { value: "Analyst", label: "Analyst" },
  { value: "Other", label: "Другое" },
];

const OTHER_ROLE = "Other";


const getUserLabel = (user: User) =>
  user.name ?? user.email ?? String(user.id);

export default function AddAssigneeForm({
  save,
  isOpen,
  onClose,
  users,
}: {
  onClose: () => void;
  isOpen: boolean;
  save: (assignee: Executor) => void;
  users: User[];
}) {
  const [form] = Form.useForm<AddFormValues>();
  const role = Form.useWatch("role", form);

  const userOptions = useMemo(
    () =>
      users.map((u) => ({
        value: u.id,
        label: getUserLabel(u),
      })),
    [users],
  );

  const submitAdd = async () => {
    try {
      const values = await form.validateFields();

      const user = users.find((u) => u.id === values.userId);
      if (!user) {
        message.error("Пользователь не найден");
        return;
      }

      const userLabel = getUserLabel(user);

      const finalRole =
        values.role === OTHER_ROLE ? values.customRole!.trim() : values.role;

      const newExecutor: Executor = {
        user_id: values.userId,
        login: user.login,
        email: user.email,
        user_name: userLabel,
        role_in_task: finalRole,
        hours: values.hours ?? 0,
        planned: values.planned ?? 1,
        hourly_rate: values.hourly_rate_from_admin,
        is_active: true,
      };
      console.log(newExecutor);
      await save(newExecutor);

      message.success(`${userLabel} добавлен`);
      onClose();
    } catch {
      /* ошибки валидации покажет сама Form */
    }
  };

  return (
    <Modal
      open={isOpen}
      title="Добавить исполнителя"
      onCancel={onClose}
      onOk={submitAdd}
      okText="Добавить"
      cancelText="Отмена"
      destroyOnHidden
      okButtonProps={{ icon: <PlusOutlined /> }}
    >
      <Form
        form={form}
        className={styles.form}
        layout="vertical"
        requiredMark={false}
        initialValues={{
          role: "Backend",
          hours: 0,
          planned: 1,
          hourly_rate_from_admin: 0,
        }}
      >
        <Form.Item
          name="userId"
          label="Пользователь"
          rules={[{ required: true, message: "Выберите пользователя" }]}
        >
          <Select
            showSearch
            placeholder="Выберите из списка"
            options={userOptions}
            optionFilterProp="label"
            filterOption={(input, option) =>
              String(option?.label ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            autoFocus
          />
        </Form.Item>

        <Form.Item
          name="role"
          label="Роль"
          rules={[{ required: true, message: "Выберите роль" }]}
        >
          <Select placeholder="Роль" options={ROLE_OPTIONS} />
        </Form.Item>

        {role === OTHER_ROLE && (
          <Form.Item
            name="customRole"
            label="Своя роль"
            rules={[
              { required: true, message: "Укажите роль" },
              { max: 60, message: "Максимум 60 символов" },
              {
                validator: (_, value) =>
                  value && !value.trim()
                    ? Promise.reject(new Error("Роль не может быть пустой"))
                    : Promise.resolve(),
              },
            ]}
          >
            <Input placeholder="Например, SRE" autoFocus />
          </Form.Item>
        )}

        <Form.Item
          name="hourly_rate_from_admin"
          label="Почасовая ставка, ₽"
          rules={[
            { required: true, message: "Укажите ставку" },
            { type: "number", min: 0, message: "Ставка не может быть меньше 0" },
          ]}
        >
          <InputNumber
            min={0}
            step={100}
            precision={2}
            style={{ width: "100%" }}
            placeholder="Например, 1500"
          />
        </Form.Item>

        <Space size={12} className={styles.hoursRow}>
          <Form.Item
            name="hours"
            label="Факт, ч"
            rules={[
              { type: "number", min: 0, message: "Не может быть меньше 0" },
            ]}
          >
            <InputNumber min={0} step={0.5} placeholder="0" />
          </Form.Item>

          <Form.Item
            name="planned"
            label="План, ч"
            rules={[{ type: "number", min: 0.5, message: "Минимум 0.5 ч" }]}
          >
            <InputNumber min={0.5} step={0.5} placeholder="1" />
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  );
}