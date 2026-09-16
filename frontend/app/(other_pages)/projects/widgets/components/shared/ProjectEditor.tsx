import { DatePicker, Form, Input, InputNumber, Modal } from "antd";
import { IProject } from "@/app/shared/interface/project.interface";
import { useEffect } from "react";
import dayjs from "dayjs";

export default function ProjectEditor({
  onSave,
  onReset,
  editingRecord = null,
}: {
  onSave: (project: IProject) => void;
  editingRecord: IProject | null;
  onReset: () => void;
}) {
  const [form] = Form.useForm<IProject>();

  useEffect(() => {
    if (editingRecord) {
      form.setFieldsValue({
        name: editingRecord.name,
        description: editingRecord.description,
        budget_hours: editingRecord.budget_hours,
        deadline: editingRecord.deadline,
      });
    }
  }, [editingRecord]);

  const closeEdit = () => {
    onReset();
    form.resetFields();
  };

  const handleSave = async () => {
    try {
      const project = await form.validateFields();
      onSave(project);
      closeEdit();
    } catch {
      // Валидация не прошла — ничего не делаем
    }
  };

  return (
    <Modal
      title="Редактирование проекта"
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
                description: editingRecord.description,
                budgetHours: editingRecord.budget_hours,
                deadline: editingRecord.deadline,
              }
            : undefined
        }
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
