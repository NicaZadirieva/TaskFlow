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
import TaskAssignees from './Assignees';

const { Text, Title } = Typography;

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const [editing, setEditing] = useState<Assignee | null>(null);
  return (
    <Card
      hoverable
      style={{ borderRadius: 12 }}
      styles={{ body: { padding: 20 } }}
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
  );
};

export default TaskCard;
