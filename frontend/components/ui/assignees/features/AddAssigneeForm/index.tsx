"use client";

import { Form, Input, InputNumber, message, Modal, Select, Space } from "antd";

import { PlusOutlined } from "@ant-design/icons";

import { assignee } from "@/app/(other_pages)/tasks/mock-data/assignee";
import { Executor } from "@/entities/executor.interface";
import styles from "./index.module.css";


interface AddFormValues {
  name: string;
  role: string;
  customRole?: string;
  hours?: number;
  planned?: number;
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

export default function AddAssigneeForm({
  save,
  isOpen,
  onClose,
}: {
  onClose: () => void;
  isOpen: boolean;
  save: (assignee: Executor) => void;
}) {
  const [form] = Form.useForm<AddFormValues>();
  const role = Form.useWatch("role", form);

  const submitAdd = async () => {
    try {
      const values = await form.validateFields();

      const finalRole =
        values.role === OTHER_ROLE ? values.customRole!.trim() : values.role;
      await save(assignee);

      message.success(`${values.name.trim()} добавлен`);
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
        initialValues={{ role: "Backend", hours: 0, planned: 1 }}
      >
        <Form.Item
          name="name"
          label="Имя"
          rules={[
            { required: true, message: "Укажите имя" },
            { max: 60, message: "Максимум 60 символов" },
          ]}
        >
          <Input placeholder="Например, Иван П." autoFocus />
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

        <Space size={12} className={styles.hoursRow}>
          <Form.Item
            name="hours"
            label="Факт, ч"
            //style={{ flex: 1, marginBottom: 0 }}
            rules={[
              { type: "number", min: 0, message: "Не может быть меньше 0" },
            ]}
          >
            <InputNumber
              min={0}
              step={0.5}
              /*style={{ width: "100%" }}*/ placeholder="0"
            />
          </Form.Item>

          <Form.Item
            name="planned"
            label="План, ч"
            //style={{ flex: 1, marginBottom: 0 }}
            rules={[{ type: "number", min: 0.5, message: "Минимум 0.5 ч" }]}
          >
            <InputNumber
              min={0.5}
              step={0.5}
              /*style={{ width: "100%" }}*/ placeholder="1"
            />
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  );
}
