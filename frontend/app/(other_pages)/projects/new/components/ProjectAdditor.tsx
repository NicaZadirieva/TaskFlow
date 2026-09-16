"use client";
import { DatePicker, Form, Input, InputNumber, message, Modal } from "antd";
import { IProject } from "@/app/shared/interface/project.interface";

import { toNewProjectSchema } from "@/app/(other_pages)/api/to_schema/to_project";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import createProjectReq from '../api/create_project.req';

export default function ProjectAdditor() {
  const [form] = Form.useForm<Omit<IProject, "id">>();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const onCreate = async (project: Omit<IProject, "id">) => {
    // deadline из DatePicker приходит как Dayjs — приводим к Date
    const normalized: Omit<IProject, "id"> = {
      ...project,
      deadline: project.deadline ? dayjs(project.deadline).toDate() : undefined,
    };

    try {
      await createProjectReq(toNewProjectSchema(normalized));
      router.push("/projects");
      message.success("Создание прошло успешно");
    } catch (e) {
      console.error("Ошибка создания", e);
      message.error("Ошибка создания проекта");
    }
  };

  const handleSave = async () => {
    try {
      const project = await form.validateFields();
      onCreate(project);
    } catch {
      // Валидация не прошла — ничего не делаем
    }
  };

  return (
    <Modal
      title="Создание проекта"
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
      >
        <Form.Item
          label="Название"
          name="name"
          rules={[{ required: true, message: "Введите название" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Описание" name="description">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item label="Бюджет (часы)" name="budgetHours">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Дедлайн"
          name="deadline"
          getValueProps={(value) => ({
            value: value ? dayjs(value) : undefined,
          })}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}