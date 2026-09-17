"use client";

import React, { useState } from "react";
import {
  Card,
  Tag,
  Space,
  Typography,
  Divider,
  message,
  Modal,
  Select,
  Badge,
} from "antd";

import Link from "next/link";
import { TaskLabels } from "../TaskLabels";
import {
  PRIORITY_META,
  STATUS_META,
  Task,
} from "../../interface/task.interface";
import { Assignee } from "../../interface/assignee.interface";
import TaskShowMetrics from "./TaskShowMetrics";
import TaskNote from './TaskNote';
import TaskAssignees from './assignee/Assignees';
import LogHoursModal from './LogHoursModal';

const { Text, Title } = Typography;

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const [editing, setEditing] = useState<Assignee | null>(null);
   const [logOpen, setLogOpen] = useState(false);
  const [logTarget, setLogTarget] = useState<Assignee | null>({
    id: 17,
    user_id: 17,
    name: 'Мария С.',
    role: 'Backend',
    hours: 18,
    planned: 10,
    removed: true,
    removeReason: 'заболела',
  });


  /** Клик по карточке */
  const handleCardClick = (e: React.MouseEvent) => {
    // Игнорируем клики по интерактивным элементам внутри
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('.ant-select') ||
      target.closest('.ant-dropdown') ||
      target.closest('[data-stop-card-click]')
    ) {
      return;
    }
    setLogOpen(true);
  };

  /** Сохранение часов */
  const handleSaveHours = async (hours: number, comment?: string) => {
    if (!logTarget) return;
    try {
      // await api.patch(`/tasks/${task.id}/assignees/${logTarget.id}`, { hours, comment });
      //assigneesRef.current?.setHours(logTarget.id, hours);
      message.success(`Часы обновлены: ${hours} ч`);
    } catch {
      message.error('Не удалось сохранить часы');
      throw new Error('save failed');
    }
  };
  return (
    <>
    <Card
      hoverable
      style={{ borderRadius: 12 }}
      styles={{ body: { padding: 20 } }}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <Badge
            status={PRIORITY_META[task.priority].color}
            text={PRIORITY_META[task.priority].label}
          />
          <Text
            type="secondary"
            style={{ fontSize: 12, fontFamily: "monospace", marginLeft: "8px" }}
          >
            {task.id}
          </Text>
          <Title level={5} style={{ margin: "2px 0 0", fontSize: 16 }}>
            {task.title}
          </Title>
        </div>

        <Space size={6} wrap>
          <Tag color={STATUS_META[task.status].color}>
            {STATUS_META[task.status].label}
          </Tag>
        </Space>
      </div>
      {task.project_id && (
        <Link href={"/projects/" + task.project_id}>К проекту</Link>
      )}
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
      <TaskShowMetrics
        actualBudget={task.budget.fact}
        actualHours={task.hours.fact}
        estimatedBudget={task.budget.planned}
        estimatedHours={task.hours.planned}
        due_date={task.due_date}
        overdueDays={task.overdueDays}
      />

      {/* Note */}
      {task.note && (
        <TaskNote note={task.note}/>
      )}

      <Divider style={{ margin: "16px 0 12px" }} />

      {/* Assignees */}
      <TaskAssignees initial={task.assignees} setEditing={setEditing}/>

      <Divider style={{ margin: "12px 0" }} />

      {/* Modal смены исполнителя */}
      <Modal
        open={!!editing}
        title="Сменить исполнителя"
        onCancel={() => setEditing(null)}
        onOk={() => {
          message.success("Исполнитель обновлён");
          setEditing(null);
        }}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Select
          style={{ width: "100%" }}
          defaultValue={editing?.name}
          options={[
            { value: "Алексей К.", label: "Алексей К. — Frontend" },
            { value: "Мария С.", label: "Мария С. — Backend" },
            { value: "Иван П.", label: "Иван П. — Backend" },
            { value: "Дмитрий П.", label: "Дмитрий П. — Tech Lead" },
          ]}
        />
      </Modal>
    </Card>
    <LogHoursModal
        open={logOpen}
        assignee={logTarget}
        taskTitle={task.title}
        onClose={() => {
          setLogOpen(false);
          setLogTarget(null);
        }}
        onSave={handleSaveHours}
      />
      </>
  );
};

export default TaskCard;
