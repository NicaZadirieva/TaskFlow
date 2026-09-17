'use client';

import React, { useState } from 'react';
import {
  Card,
  Progress,
  Tag,
  Avatar,
  Button,
  Space,
  Typography,
  Divider,
  Tooltip,
  message,
  Modal,
  Select,
  Badge,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  WarningOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { TaskLabels } from './TaskLabels';

const { Text, Title } = Typography;

// TODO: добавить OPEN в backend
type Status = 'OPEN' | 'BACKLOG' | 'IN_PROGRESS' | 'DONE';
type Priority = 'LOW' | 'HIGH' | 'MEDIUM';

export interface Assignee {
  id: string;
  name: string;
  role: string;
  hours: number;
  planned: number;
  color: string;
  textColor: string;
}

// GitHub label: color — hex БЕЗ '#' (6 символов), description — опционально
export type GithubLabel = {
  id?: number;
  name: string;
  color: string;        // hex без '#'
  description?: string | null;
  default?: boolean;
};

export interface Task {
  id: string;
  project_id?: number; 
  title: string;
  status: Status;
  hours: { fact: number; planned: number; unit?: string };
  // TODO: добавить estimated_budget, actial_budget в БД
  budget: { fact: number; planned: number };
  estimate: { planned: number; fact: number };
  ratio: number | null; // TODO: посчитать через БД и вернуть
  due_date: string; // TODO: перевести datetime schema Task
  overdueDays: number; // TODO: посчитать через БД и вернуть
  // jsonb
  note?: { kind: 'danger' | 'info'; label: string; text: string };
  assignees: Assignee[];
  tags: GithubLabel[];
  priority: Priority
}



const STATUS_META: Record<Status, { color: string; label: string }> = {
  OPEN: { color: 'blue', label: 'open' },
  IN_PROGRESS: { color: 'orange', label: 'in progress' },
  DONE: { color: 'green', label: 'done' },
  BACKLOG: {color: 'yellow', label: 'backlog'}
};

const PRIORITY_META: Record<Priority, {color: 'success' | 'error' | 'default'; label: string}> = {
	LOW: { color: 'success', label: 'low'},
	HIGH: {color: 'error', label: 'high'},
	MEDIUM: {color: 'default', label: 'medium'}
}




const fmt = (n: number) => n.toLocaleString('ru-RU');

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const [assignees, setAssignees] = useState<Assignee[]>(task.assignees);
  const [editing, setEditing] = useState<Assignee | null>(null);

  const removeAssignee = (id: string) => {
    const a = assignees.find((x) => x.id === id);
    if (!a) return;
    Modal.confirm({
      title: 'Удалить исполнителя?',
      content: `${a.name} будет снят с задачи.`,
      okText: 'Удалить',
      okButtonProps: { danger: true },
      cancelText: 'Отмена',
      onOk: () => {
        setAssignees((prev) => prev.filter((x) => x.id !== id));
        message.success(`${a.name} удалён`);
      },
    });
  };

  const addAssignee = () => {
    const id = String(Date.now());
    setAssignees((prev) => [
      ...prev,
      {
        id,
        name: 'Новый исполнитель',
        role: 'TBD',
        hours: 0,
        planned: 1,
        color: '#dbeafe',
        textColor: '#2563eb',
      },
    ]);
    message.info('Исполнитель добавлен');
  };

  const timeOverdue = task.hours.fact > task.hours.planned;
  const budgetOverdue = task.budget.fact > task.budget.planned;
  const timePercent = Math.min(
    100,
    Math.round((task.hours.fact / task.hours.planned) * 100),
  );
  const budgetPercent = Math.min(
    100,
    Math.round((task.budget.fact / task.budget.planned) * 100),
  );
  const timeColor = timeOverdue ? '#dc2626' : '#16a34a';
  const budgetColor = budgetOverdue ? '#dc2626' : '#16a34a';

  const status = STATUS_META[task.status];


  return (
    <Card
      hoverable
      style={{ borderRadius: 12 }}
      styles={{ body: { padding: 20 } }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
		<Badge status={PRIORITY_META[task.priority].color} text={PRIORITY_META[task.priority].label}/>
          <Text type="secondary" style={{ fontSize: 12, fontFamily: 'monospace', marginLeft: '8px' }}>
            {task.id}
          </Text>
          <Title level={5} style={{ margin: '2px 0 0', fontSize: 16 }}>
            {task.title}
          </Title>
		  
        </div>
		
        <Space size={6} wrap>
          <Tag color={STATUS_META[task.status].color}>{STATUS_META[task.status].label}</Tag>
        </Space>
      </div>
	  {task.project_id && <Link href={"/projects/" + task.project_id}>К проекту</Link> }
	  {/* GitHub labels */}
      {task.tags.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <TaskLabels
            labels={task.tags}
            max={4}
            onSelect={(l) => message.info(`Фильтр по метке: ${l.name}`)}
          />
        </div>
      )}
      {/* Metrics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
            <Text type="secondary">Время</Text>
            <span>
              <Text strong>{task.hours.fact}</Text>{' '}
              <Text type="secondary" style={{ fontSize: 11 }}>
                / {task.hours.planned} ч{task.hours.unit ? ` (${task.hours.unit})` : ''}
              </Text>
            </span>
          </div>
          <Progress
            percent={timePercent}
            showInfo={false}
            strokeColor={timeColor}
            railColor="#eef0f3"
            size={['100%', 8]}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
            <Text type="secondary">Бюджет</Text>
            <span>
              <Text strong>{fmt(task.budget.fact)}</Text>{' '}
              <Text type="secondary" style={{ fontSize: 11 }}>
                / {fmt(task.budget.planned)} ₽
              </Text>
            </span>
          </div>
          <Progress
            percent={budgetPercent}
            showInfo={false}
            strokeColor={budgetColor}
            railColor="#eef0f3"
            size={['100%', 8]}
          />
        </div>
      </div>

      <div>
        <FactRow label="Дедлайн" value={task.due_date} />
        <FactRow
          label="Просрочка"
          value={task.overdueDays > 0 ? `+${task.overdueDays} дней` : 'нет'}
          valueStyle={
            task.overdueDays > 0
              ? { color: '#dc2626' }
              : { color: '#16a34a' }
          }
        />
      </div>

      {/* Note */}
      {task.note && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'flex-start',
            borderRadius: 8,
            padding: '10px 12px',
            marginTop: 12,
            fontSize: 12,
            lineHeight: 1.4,
            background: task.note.kind === 'danger' ? '#fef2f2' : '#eff6ff',
            border: `1px solid ${task.note.kind === 'danger' ? '#fecaca' : '#bfdbfe'}`,
          }}
        >
          {task.note.kind === 'danger' ? (
            <WarningOutlined style={{ color: '#dc2626', marginTop: 2 }} />
          ) : (
            <InfoCircleOutlined style={{ color: '#2563eb', marginTop: 2 }} />
          )}
          <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
            {task.note.label}:
          </span>
          <span style={{ flex: 1 }}>{task.note.text}</span>
        </div>
      )}

      <Divider style={{ margin: '16px 0 12px' }} />

      {/* Assignees */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.3 }}>
            Исполнители
          </Text>
          <Space size={6}>
            <Text strong style={{ fontSize: 12 }}>{assignees.length}</Text>
            <Button type="link" size="small" icon={<PlusOutlined />} onClick={addAssignee}>
              добавить
            </Button>
          </Space>
        </div>

        <Space orientation="vertical" size={4} style={{ width: '100%' }}>
          {assignees.map((a) => {
            const overdue = a.hours > a.planned;
            return (
              <div
                key={a.id}
                className="assignee-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  padding: '4px 6px',
                  margin: '0 -6px',
                  borderRadius: 6,
                }}
              >
                <Avatar
                  size={24}
                  style={{
                    background: a.color,
                    color: a.textColor,
                    fontSize: 11,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {a.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                </Avatar>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {a.name}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: 0.3,
                    }}
                  >
                    {a.role}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: overdue ? '#dc2626' : '#6b7280',
                    whiteSpace: 'nowrap',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  <b style={{ color: overdue ? '#dc2626' : '#1a1d21' }}>{a.hours}</b> / {a.planned} ч
                </span>
                <Space size={2} className="assignee-actions">
                  <Tooltip title="Сменить исполнителя">
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => setEditing(a)}
                    />
                  </Tooltip>
                  <Tooltip title="Удалить">
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeAssignee(a.id)}
                    />
                  </Tooltip>
                </Space>
              </div>
            );
          })}
        </Space>
      </div>

      <Divider style={{ margin: '12px 0' }} />

     

      {/* Modal смены исполнителя */}
      <Modal
        open={!!editing}
        title="Сменить исполнителя"
        onCancel={() => setEditing(null)}
        onOk={() => {
          message.success('Исполнитель обновлён');
          setEditing(null);
        }}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Select
          style={{ width: '100%' }}
          defaultValue={editing?.name}
          options={[
            { value: 'Алексей К.', label: 'Алексей К. — Frontend' },
            { value: 'Мария С.', label: 'Мария С. — Backend' },
            { value: 'Иван П.', label: 'Иван П. — Backend' },
            { value: 'Дмитрий П.', label: 'Дмитрий П. — Tech Lead' },
          ]}
        />
      </Modal>
    </Card>
  );
};

const FactRow: React.FC<{
  label: string;
  value: string;
  valueStyle?: React.CSSProperties;
}> = ({ label, value, valueStyle }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: 12,
      padding: '6px 0',
      borderBottom: '1px solid #e5e7eb',
    }}
  >
    <span
      style={{
        color: '#6b7280',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontWeight: 600,
        textAlign: 'right',
        fontVariantNumeric: 'tabular-nums',
        ...valueStyle,
      }}
    >
      {value}
    </span>
  </div>
);





export default TaskCard;