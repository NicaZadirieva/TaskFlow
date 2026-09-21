"use client";

import {
  Priority,
  Status,
  Task,
} from "@/app/(other_pages)/tasks/interfaces/task.interface";
import {
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Typography,
} from "antd";
import styles from "./index.module.css";
import { Controller, useForm } from "react-hook-form";
import EditTaskFormData from "./EditTaskFormData.interface";
import { getFormErrorMessage } from "@/app/shared/utils/getFormErrorMessage";
import dayjs from "dayjs";
import cn from 'classnames';
import { Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { TextArea } = Input;

export default function EditTaskForm({ task }: { task: Task }) {
  const { handleSubmit, control } = useForm<EditTaskFormData>({
    defaultValues: {
      ...task,
	   tags: task.tags?.map((t) => t.name) ?? [],
      due_date: task.due_date ? new Date(task.due_date) : undefined,
    },
  });

  return (
    <Card className={styles.card} title="Редактировать задачу">
      <Form className={styles["form"]} layout="vertical">
        {/* ---------- title ---------- */}
        <Controller
          name="title"
          control={control}
          rules={{ required: "Название задачи обязательно" }}
          render={({ field, fieldState: { error } }) => (
            <Form.Item
              label="Название задачи"
              validateStatus={error ? "error" : ""}
              help={error ? getFormErrorMessage(error) : " "}
              required
            >
              <Input
                {...field}
                type="text"
                placeholder="Название задачи"
                size="large"
              />
            </Form.Item>
          )}
        />

        {/* ---------- description ---------- */}
        <Controller
          name="description"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Form.Item
              label="Описание"
              validateStatus={error ? "error" : ""}
              help={error ? getFormErrorMessage(error) : " "}
            >
              <TextArea
                {...field}
                rows={4}
                placeholder="Описание задачи"
                size="large"
              />
            </Form.Item>
          )}
        />

        {/* ---------- status ---------- */}
        <Controller
          name="status"
          control={control}
          rules={{ required: "Обозначьте статус" }}
          render={({ field, fieldState: { error } }) => (
            <Form.Item
              label="Статус выполнения задачи"
              validateStatus={error ? "error" : ""}
              help={error ? getFormErrorMessage(error) : " "}
              required
            >
              <Select
                {...field}
                placeholder="Выберите статус"
                size="large"
                options={[
                  { value: "OPEN", label: "К выполнению" },
                  { value: "IN_PROGRESS", label: "В работе" },
                  { value: "DONE", label: "Выполнено" },
                  { value: "BACKLOG", label: "В бэклог" },
                ]}
              />
            </Form.Item>
          )}
        />

        {/* ---------- priority ---------- */}
        <Controller
          name="priority"
          control={control}
          rules={{ required: "Обозначьте приоритет" }}
          render={({ field, fieldState: { error } }) => (
            <Form.Item
              label="Приоритет"
              validateStatus={error ? "error" : ""}
              help={error ? getFormErrorMessage(error) : " "}
              required
            >
              <Select
                {...field}
                placeholder="Выберите приоритет"
                size="large"
                options={[
                  { value: "LOW", label: "Низкий" },
                  { value: "MEDIUM", label: "Средний" },
                  { value: "HIGH", label: "Высокий" },
                  { value: "CRITICAL", label: "Критичный" },
                ]}
              />
            </Form.Item>
          )}
        />

        {/* ---------- due_date ---------- */}
        <Controller
          name="due_date"
          control={control}
          rules={{ required: "Обозначьте дату окончания работ (дедлайн)" }}
          render={({ field, fieldState: { error } }) => (
            <Form.Item
              label="Дедлайн"
              validateStatus={error ? "error" : ""}
              help={error ? getFormErrorMessage(error) : " "}
              required
            >
              <DatePicker
                value={field.value ? dayjs(field.value) : null}
                onChange={(date) =>
                  field.onChange(date ? date.toDate() : undefined)
                }
                format="DD.MM.YYYY"
                placeholder="Выберите дату"
                size="large"
                style={{ width: "100%" }}
              />
            </Form.Item>
          )}
        />

        {/* ---------- hours ---------- */}
        <Form.Item label="Часы">
          <div className={styles.row}>
            <Controller
              name="hours.planned"
              control={control}
              rules={{ required: "Плановые часы обязательны" }}
              render={({ field, fieldState: { error } }) => (
                <Form.Item
                  validateStatus={error ? "error" : ""}
                  help={error ? getFormErrorMessage(error) : " "}
                >
                  <InputNumber
                    {...field}
                    min={0}
                    placeholder="Плановые"
                    size="large"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              )}
            />
            <Controller
              name="hours.fact"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Form.Item
                  validateStatus={error ? "error" : ""}
                  help={error ? getFormErrorMessage(error) : " "}
                >
                  <InputNumber
                    {...field}
                    min={0}
                    placeholder="Фактические"
                    size="large"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              )}
            />
          </div>
        </Form.Item>

        {/* ---------- budget ---------- */}
        <Form.Item label="Бюджет">
          <div className={styles.row}>
            <Controller
              name="budget.planned"
              control={control}
              rules={{ required: "Плановый бюджет обязателен" }}
              render={({ field, fieldState: { error } }) => (
                <Form.Item
                  validateStatus={error ? "error" : ""}
                  help={error ? getFormErrorMessage(error) : " "}
                >
                  <InputNumber
                    {...field}
                    min={0}
                    placeholder="Плановый"
                    size="large"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              )}
            />
            <Controller
              name="budget.fact"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Form.Item
                  validateStatus={error ? "error" : ""}
                  help={error ? getFormErrorMessage(error) : " "}
                >
                  <InputNumber
                    {...field}
                    min={0}
                    placeholder="Фактический"
                    size="large"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              )}
            />
          </div>
        </Form.Item>

      

        {/* ---------- tags ---------- */}
        <Controller
  name="tags"
  control={control}
  render={({ field, fieldState: { error } }) => (
    <Form.Item
      label="Теги"
      validateStatus={error ? "error" : ""}
      help={error ? getFormErrorMessage(error) : " "}
    >
      <Select
        {...field}
        mode="tags"
        placeholder="Выберите или введите теги"
        size="large"
        tokenSeparators={[","]}
        options={(task.tags ?? []).map((t) => ({
          value: t.name,
          label: t.name,
        }))}
      />
    </Form.Item>
  )}
/>
        {/* ---------- note ---------- */}
        <Form.Item label="Заметка">
          <div className={cn(styles.row, styles.noteRow )}>
            <Controller
              name="note.kind"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Тип"
                  size="large"
                  style={{ width: 160 }}
                  options={[
                    { value: "info", label: "Простая" },
                    { value: "danger", label: "Важно" },
                  ]}
                />
              )}
            />
            <Controller
              name="note.label"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Form.Item
                  validateStatus={error ? "error" : ""}
                  help={error ? getFormErrorMessage(error) : " "}
                >
                  <Input {...field} placeholder="Заголовок" size="large" />
                </Form.Item>
              )}
            />
          </div>
          <Controller
            name="note.text"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Form.Item
                validateStatus={error ? "error" : ""}
                help={error ? getFormErrorMessage(error) : " "}
              >
                <TextArea
                  {...field}
                  rows={3}
                  placeholder="Текст заметки"
                  size="large"
                />
              </Form.Item>
            )}
          />
        </Form.Item>

        {/* ---------- task_images ---------- */}
        <Controller
  name="task_images"
  control={control}
  render={({ field, fieldState: { error } }) => (
    <Form.Item
      label="Изображения"
      validateStatus={error ? "error" : ""}
      help={error ? getFormErrorMessage(error) : " "}
    >
      <Upload
        listType="picture-card"
        accept="image/*"
        multiple
        fileList={field.value?.map((url, index) => ({
          uid: String(index),
          name: `image-${index}`,
          status: "done",
          url,
        }))}
        beforeUpload={(file) => {
          // Конвертируем File в URL (или base64, или загружаем на сервер)
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            field.onChange([...(field.value ?? []), reader.result as string]);
          };
          return false; // Предотвращаем автоматическую загрузку
        }}
        onRemove={(file) => {
          const newImages = field.value?.filter(
            (url) => url !== file.url
          );
          field.onChange(newImages);
        }}
      >
        {field.value && field.value.length >= 8 ? null : (
          <div>
            <UploadOutlined />
            <div style={{ marginTop: 8 }}>Загрузить</div>
          </div>
        )}
      </Upload>
    </Form.Item>
  )}
/>
      </Form>
    </Card>
  );
}