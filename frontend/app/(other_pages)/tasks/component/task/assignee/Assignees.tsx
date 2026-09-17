'use client';

import {
  Button,
  message,
  Modal,
  Space,
  Tooltip,
  Typography,
  Select,
  Input,
  Form,
  InputNumber,
} from 'antd';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { Assignee } from '../../../interface/assignee.interface';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import styles from './index.module.css';

const { Text } = Typography;
const { TextArea } = Input;

const REMOVE_REASONS = [
  { value: 'заболел', label: 'Заболел' },
  { value: 'отпуск', label: 'Отпуск' },
  { value: 'переведён на другой проект', label: 'Переведён на другой проект' },
  { value: 'не хватает компетенций', label: 'Не хватает компетенций' },
  { value: 'конфликт интересов', label: 'Конфликт интересов' },
  { value: 'задача отменена', label: 'Задача отменена' },
  { value: '__custom', label: 'Другое…' },
];

const ROLE_OPTIONS = [
  { value: 'Frontend', label: 'Frontend' },
  { value: 'Backend', label: 'Backend' },
  { value: 'DevOps', label: 'DevOps' },
  { value: 'Tech Lead', label: 'Tech Lead' },
  { value: 'QA', label: 'QA' },
  { value: 'Designer', label: 'Designer' },
  { value: 'Analyst', label: 'Analyst' },
];

const AVATAR_PALETTE = [
  { color: '#dbeafe', textColor: '#2563eb' },
  { color: '#fef3c7', textColor: '#d97706' },
  { color: '#dcfce7', textColor: '#16a34a' },
  { color: '#ede9fe', textColor: '#7c3aed' },
  { color: '#fee2e2', textColor: '#dc2626' },
];

interface Props {
  initial: Assignee[];
  setEditing: Dispatch<SetStateAction<Assignee | null>>;
}

interface AddFormValues {
  name: string;
  role: string;
  hours?: number;
  planned?: number;
}

export default function TaskAssignees({ initial, setEditing }: Props) {
  const [assignees, setAssignees] = useState<Assignee[]>(initial);

  // Модалка удаления
  const [removing, setRemoving] = useState<Assignee | null>(null);
  const [removeReason, setRemoveReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');

  // Модалка добавления
  const [adding, setAdding] = useState(false);
  const [form] = Form.useForm<AddFormValues>();

  const activeCount = useMemo(
    () => assignees.filter((a) => !a.removed).length,
    [assignees],
  );
  const removedCount = assignees.length - activeCount;

  /* ---------- Удаление ---------- */
  const openRemoveModal = (a: Assignee) => {
    setRemoving(a);
    setRemoveReason('');
    setCustomReason('');
  };

  const closeRemoveModal = () => {
    setRemoving(null);
    setRemoveReason('');
    setCustomReason('');
  };

  const confirmRemove = () => {
    if (!removing) return;
    const reason =
      removeReason === '__custom' ? customReason.trim() : removeReason;
    if (!reason) {
      message.warning('Укажите причину удаления');
      return;
    }

    setAssignees((prev) =>
      prev.map((x) =>
        x.id === removing.id
          ? { ...x, removed: true, removeReason: reason }
          : x,
      ),
    );
    message.success(`${removing.name} удалён: ${reason}`);
    closeRemoveModal();
  };

  const undoRemove = (id: number) => {
    setAssignees((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, removed: false, removeReason: undefined } : x,
      ),
    );
    message.info('Удаление отменено');
  };

  /* ---------- Добавление ---------- */
  const openAddModal = () => {
    form.resetFields();
    form.setFieldsValue({ role: 'Backend', hours: 0, planned: 1 });
    setAdding(true);
  };

  const closeAddModal = () => {
    setAdding(false);
    form.resetFields();
  };

  const submitAdd = async () => {
    try {
      const values = await form.validateFields();
      const palette =
        AVATAR_PALETTE[assignees.length % AVATAR_PALETTE.length];
      const id = 1; // TODO: изменить

      setAssignees((prev) => [
        ...prev,
        {
          id,
          user_id: 1, // TODO: изменить
          name: values.name.trim(),
          role: values.role,
          hours: values.hours ?? 0,
          planned: values.planned ?? 1,
          color: palette.color,
          textColor: palette.textColor,
        },
      ]);

      message.success(`${values.name.trim()} добавлен`);
      closeAddModal();
    } catch {
      /* ошибки валидации покажет сама Form */
    }
  };

  const canConfirm =
    removeReason === '__custom'
      ? customReason.trim().length > 0
      : removeReason.length > 0;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <Text
          type="secondary"
          style={{
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: 0.3,
          }}
        >
          Исполнители
        </Text>
        <Space size={6}>
          <Text strong style={{ fontSize: 12 }}>
            {activeCount}
          </Text>
          {removedCount > 0 && (
            <Text style={{ fontSize: 11, color: '#dc2626' }} title="Удалённые">
              −{removedCount}
            </Text>
          )}
          <Button
            type="link"
            size="small"
            icon={<PlusOutlined />}
            onClick={openAddModal}
          >
            добавить
          </Button>
        </Space>
      </div>

      {/* Список */}
      <Space orientation="vertical" size={4} style={{ width: '100%' }}>
        {assignees.map((a) => {
          const overdue = a.hours > a.planned;
          const removed = !!a.removed;

          return (
            <div
              key={a.id}
              className={styles[
                `assignee-row${removed ? ' assignee-row--removed' : ''}`
              ]}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                padding: '4px 6px',
                margin: '0 -6px',
                borderRadius: 6,
                opacity: removed ? 0.6 : 1,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    textDecoration: removed ? 'line-through' : 'none',
                    textDecorationColor: 'rgba(220,38,38,.5)',
                  }}
                >
                  {a.name}
                  {removed && (
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: 0.3,
                        textTransform: 'uppercase',
                        padding: '1px 6px',
                        borderRadius: 999,
                        background: '#fef2f2',
                        color: '#dc2626',
                      }}
                    >
                      removed
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: 0.3,
                  }}
                >
                  {removed && a.removeReason ? (
                    <span style={{ color: '#dc2626', fontWeight: 600 }}>
                      причина: {a.removeReason}
                    </span>
                  ) : (
                    a.role
                  )}
                </div>
              </div>

              <span
                style={{
                  fontSize: 11,
                  color: overdue && !removed ? '#dc2626' : '#6b7280',
                  whiteSpace: 'nowrap',
                  fontVariantNumeric: 'tabular-nums',
                  textDecoration: removed ? 'line-through' : 'none',
                }}
              >
                <b
                  style={{
                    color: overdue && !removed ? '#dc2626' : '#1a1d21',
                  }}
                >
                  {a.hours}
                </b>{' '}
                / {a.planned} ч
              </span>

              <Space size={2} className={styles['assignee-actions']}>
                {removed ? (
                  <Tooltip title="Восстановить">
                    <Button
                      type="text"
                      size="small"
                      icon={<UndoOutlined />}
                      onClick={() => undoRemove(a.id)}
                    />
                  </Tooltip>
                ) : (
                  <>
                    <Tooltip title="Удалить">
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => openRemoveModal(a)}
                      />
                    </Tooltip>
                  </>
                )}
              </Space>
            </div>
          );
        })}
      </Space>

      {/* Модалка добавления */}
      <Modal
        open={adding}
        title="Добавить исполнителя"
        onCancel={closeAddModal}
        onOk={submitAdd}
        okText="Добавить"
        cancelText="Отмена"
        destroyOnHidden
        okButtonProps={{ icon: <PlusOutlined /> }}
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={{ role: 'Backend', hours: 0, planned: 1 }}
        >
          <Form.Item
            name="name"
            label="Имя"
            rules={[
              { required: true, message: 'Укажите имя' },
              { max: 60, message: 'Максимум 60 символов' },
            ]}
          >
            <Input placeholder="Например, Иван П." autoFocus />
          </Form.Item>

          <Form.Item
            name="role"
            label="Роль"
            rules={[{ required: true, message: 'Выберите роль' }]}
          >
            <Select placeholder="Роль" options={ROLE_OPTIONS} />
          </Form.Item>

          <Space size={12} style={{ display: 'flex' }}>
            <Form.Item
              name="hours"
              label="Факт, ч"
              style={{ flex: 1, marginBottom: 0 }}
              rules={[
                { type: 'number', min: 0, message: 'Не может быть меньше 0' },
              ]}
            >
              <InputNumber
                min={0}
                step={0.5}
                style={{ width: '100%' }}
                placeholder="0"
              />
            </Form.Item>

            <Form.Item
              name="planned"
              label="План, ч"
              style={{ flex: 1, marginBottom: 0 }}
              rules={[
                {
                  type: 'number',
                  min: 0.5,
                  message: 'Минимум 0.5 ч',
                },
              ]}
            >
              <InputNumber
                min={0.5}
                step={0.5}
                style={{ width: '100%' }}
                placeholder="1"
              />
            </Form.Item>
          </Space>
        </Form>
      </Modal>

      {/* Модалка удаления */}
      <Modal
        open={!!removing}
        title="Удалить исполнителя"
        onCancel={closeRemoveModal}
        onOk={confirmRemove}
        okText="Удалить"
        cancelText="Отмена"
        okButtonProps={{ danger: true, disabled: !canConfirm }}
        destroyOnHidden
      >
        {removing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {removing.name} · {removing.role}
            </Text>

            <div>
              <Text
                type="secondary"
                style={{
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: 0.3,
                }}
              >
                Причина удаления
              </Text>
              <Select
                style={{ width: '100%', marginTop: 4 }}
                placeholder="Выберите причину"
                value={removeReason || undefined}
                onChange={setRemoveReason}
                options={REMOVE_REASONS}
              />
            </div>

            {removeReason === '__custom' && (
              <TextArea
                autoFocus
                rows={3}
                placeholder="Опишите причину"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                maxLength={200}
                showCount
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}