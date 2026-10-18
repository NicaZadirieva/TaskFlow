"use client";



import { Task } from "@/entities/task.interface";
import { getFormErrorMessage } from "@/utils/getFormErrorMessage";
import { NewTask, TaskWithoutCreatedBy } from "@/utils/types";
import { UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Segmented,
  Select,
  Space,
  Typography,
  Upload,
} from "antd";
import dayjs from "dayjs";
import { useEffect } from 'react';
import { Controller, useForm } from "react-hook-form";
import EditTaskFormProps from "./EditTaskForm.props";
import EditTaskFormData from "./EditTaskFormData.interface";
import styles from "./index.module.css";

const { Title, Text } = Typography;
const { TextArea } = Input;

const STATUS_OPTIONS = [
  { value: "OPEN", label: "К выполнению" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "DONE", label: "Завершена" },
];

const PRIORITY_OPTIONS = [  { value: "low", label: "Низкий" },
  { value: "medium", label: "Средний" },
  { value: "high", label: "Высокий" },
];

export default function EditTaskForm({ task, updateTask, saveTask, tagsOptions }: EditTaskFormProps) {
  
  const { handleSubmit, control, getValues, watch  } = useForm<EditTaskFormData>({
    defaultValues: {
      title: task ? task.title : "",
      status: task ? task.status : undefined,
      description: task ? task.description: "",
      priority: task ? task.priority : "medium",
      due_date: task && task.due_date ? dayjs(task.due_date).toDate() : new Date(),
      hours: task && task.hours ? task.hours : { fact: 0, planned: 0 },
      budget: task && task.budget ? task.budget : { fact: 0, planned: 0 },
      note: task ? task.note : undefined,
      tags: task?.tags?.map(tag => tag.name) ?? [],
      task_images: task?.task_images ?? [],
    },
  });
 

  /** Преобразование данных формы в Task и отдача наверх */
  const toTask = (data: EditTaskFormData): TaskWithoutCreatedBy | NewTask => ({
    ...(task ?? ({} as Task)),
    
    title: data.title,
    status: data.status,
    description: data.description,
    priority: data.priority,
    due_date: data.due_date,
    hours: data.hours,
    budget: data.budget,
    note: data.note,
    tags: data.tags?.map((tag) => { return {name: tag }}),
    task_images: data.task_images,
  });

  useEffect(() => {
    const sub = watch(() => {
      updateTask(toTask(getValues()));
    });
    return () => sub.unsubscribe();
  }, [watch, getValues, updateTask]);

  const onSubmit = async (data: EditTaskFormData) => {
    updateTask(toTask(data));
    await saveTask(toTask(data));
  };

  return (
    <Card
      className={styles.card}
      variant={"borderless"}
      styles={{ body: { padding: 32 } }}
    >
      <div className={styles.header}>
        <Title level={4} className={styles.title}>
          Редактирование задачи
        </Title>
        <Text type="secondary" className={styles.subtitle}>
          Обновите информацию и сохраните изменения
        </Text>
      </div>

      <Divider className={styles.divider} />

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        {/* --- Основное --- */}
        <section className={styles.section}>
          <Text className={styles.sectionTitle}>Основное</Text>

          <Controller
            name="title"
            control={control}
            rules={{ required: "Введите название задачи" }}
            render={({ field, fieldState }) => (
              <Form.Item
                label="Название"
                validateStatus={fieldState.error ? "error" : ""}
                help={getFormErrorMessage(fieldState.error)}
              >
                <Input
                  {...field}
                  size="large"
                  placeholder="Например: Подготовить отчёт"
                />
              </Form.Item>
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field, fieldState }) => (
              <Form.Item
                label="Описание"
                validateStatus={fieldState.error ? "error" : ""}
                help={getFormErrorMessage(fieldState.error)}
              >
                <TextArea
                  {...field}
                  rows={4}
                  showCount
                  maxLength={500}
                  placeholder="Опишите детали задачи..."
                />
              </Form.Item>
            )}
          />

          <div className={styles.row}>
            <Controller
              name="status"
              control={control}
              render={({ field, fieldState }) => (
                <Form.Item
                  label="Статус"
                  className={styles.col}
                  validateStatus={fieldState.error ? "error" : ""}
                  help={getFormErrorMessage(fieldState.error)}
                >
                  <Select
                    {...field}
                    size="large"
                    options={STATUS_OPTIONS}
                    placeholder="Выберите статус"
                  />
                </Form.Item>
              )}
            />

            <Controller
              name="priority"
              control={control}
              render={({ field, fieldState }) => (
                <Form.Item
                  label="Приоритет"
                  className={styles.col}
                  validateStatus={fieldState.error ? "error" : ""}
                  help={getFormErrorMessage(fieldState.error)}
                >
                  <Select
                    {...field}
                    size="large"
                    options={PRIORITY_OPTIONS}
                    placeholder="Выберите приоритет"
                  />
                </Form.Item>
              )}
            />

            <Controller
              name="due_date"
              control={control}
              render={({ field, fieldState }) => (
                <Form.Item
                  label="Срок"
                  className={styles.col}
                  validateStatus={fieldState.error ? "error" : ""}
                  help={getFormErrorMessage(fieldState.error)}
                >
                  <DatePicker
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(d) => field.onChange(d ? d.toDate() : null)}
                    size="large"
                    format="DD.MM.YYYY"
                    style={{ width: "100%" }}
                    placeholder="Выберите дату"
                  />
                </Form.Item>
              )}
            />
          </div>
        </section>

        <Divider className={styles.divider} />

        {/* --- Часы и бюджет --- */}
        <section className={styles.section}>
          <Text className={styles.sectionTitle}>Эталонные часы и бюджет</Text>

          <div className={styles.grid2}>
            <div className={styles.group}>
              <Text type="secondary" className={styles.groupLabel}>
                Часы
              </Text>
              <div className={styles.row}>
                <Controller
                  name="hours.planned"
                  control={control}
                  render={({ field }) => (
                    <Form.Item label="План" className={styles.col}>
                      <InputNumber
                        {...field}
                        min={0}
                        step={0.5}
                        size="large"
                        style={{ width: "100%" }}
                        placeholder="0"
                      />
                    </Form.Item>
                  )}
                />
                <Controller
                  name="hours.fact"
                  control={control}
                  render={({ field }) => (
                    <Form.Item label="Факт" className={styles.col}>
                      <InputNumber
                        {...field}
                        min={0}
                        step={0.5}
                        size="large"
                        style={{ width: "100%" }}
                        placeholder="0"
                      />
                    </Form.Item>
                  )}
                />
              </div>
            </div>

            <div className={styles.group}>
              <Text type="secondary" className={styles.groupLabel}>
                Бюджет
              </Text>
              <div className={styles.row}>
                <Controller
                  name="budget.planned"
                  control={control}
                  render={({ field }) => (
                    <Form.Item label="План" className={styles.col}>
                      <InputNumber
                        {...field}
                        min={0}
                        size="large"
                        style={{ width: "100%" }}
                        placeholder="0"
                      />
                    </Form.Item>
                  )}
                />
                <Controller
                  name="budget.fact"
                  control={control}
                  render={({ field }) => (
                    <Form.Item label="Факт" className={styles.col}>
                      <InputNumber
                        {...field}
                        min={0}
                        size="large"
                        style={{ width: "100%" }}
                        placeholder="0"
                      />
                    </Form.Item>
                  )}
                />
              </div>
            </div>
          </div>
        </section>

        <Divider className={styles.divider} />

        {/* --- Дополнительно --- */}
        <section className={styles.section}>
          <Text className={styles.sectionTitle}>Дополнительно</Text>

          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <Form.Item label="Теги">
                <Select
                  {...field}
                  mode="tags"
                  options={tagsOptions}
                  size="large"
                  placeholder="Добавьте теги и нажмите Enter"
                  tokenSeparators={[","]}
                />
              </Form.Item>
            )}
          />

          <Controller
            name="task_images"
            control={control}
            render={({ field }) => (
              <Form.Item label="Изображения">
                <Upload
                  listType="picture-card"
                  beforeUpload={() => false}
                  fileList={(field.value ?? []).map((url, i) => ({
                    uid: String(i),
                    name: `image-${i}`,
                    status: "done" as const,
                    url,
                  }))}
                  onChange={({ fileList }) =>
                    field.onChange(
                      fileList.map(
                        (f) => f.url ?? (f.originFileObj ? "" : f.name)
                      )
                    )
                  }
                  multiple
                >
                  <Button icon={<UploadOutlined />} type="text">
                    Загрузить
                  </Button>
                </Upload>
              </Form.Item>
            )}
          />

          <Controller
            name="note"
            control={control}
            render={({ field }) => (
              <Form.Item label="Заметка">
                <div className={styles.noteRow}>
                  <Segmented
                    value={field.value?.kind ?? "info"}
                    onChange={(kind) =>
                      field.onChange({
                        kind,
                        label: field.value?.label ?? "",
                        text: field.value?.text ?? "",
                      })
                    }
                    options={[
                      { label: "Инфо", value: "info" },
                      { label: "Важно", value: "danger" },
                    ]}
                  />
                  <Input
                    value={field.value?.label}
                    onChange={(e) =>
                      field.onChange({
                        kind: field.value?.kind ?? "info",
                        label: e.target.value,
                        text: field.value?.text ?? "",
                      })
                    }
                    size="large"
                    placeholder="Заголовок заметки"
                  />
                </div>
                <TextArea
                  value={field.value?.text}
                  onChange={(e) =>
                    field.onChange({
                      kind: field.value?.kind ?? "info",
                      label: field.value?.label ?? "",
                      text: e.target.value,
                    })
                  }
                  rows={2}
                  style={{ marginTop: 8 }}
                  placeholder="Текст заметки..."
                />
              </Form.Item>
            )}
          />
        </section>

        <Divider className={styles.divider} />

        <Space className={styles.actions}>
          <Button size="large" type="primary" htmlType="submit">
            Сохранить
          </Button>
          <Button size="large">Отмена</Button>
        </Space>
      </Form>
    </Card>
  );
}