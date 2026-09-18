"use client";

import React, { useState } from "react";
import {
  Card,
  Tag,
  Space,
  Typography,
  Divider,
  message,
  Badge,
  Button,
} from "antd";

import Link from "next/link";
import { TaskLabels } from "./TaskLabels";
import { PRIORITY_META, STATUS_META, Task } from "../interface/task.interface";
import { Assignee } from "../interface/assignee.interface";
import TaskShowMetrics from "./assignee/TaskShowMetrics";
import TaskNote from "./assignee/TaskNote";

import TaskAssignees from "./assignee";
import { assignee } from "./assignee/mock-data/assignee";
import AddHoursMinutesModal from "./assignee/add_hours_minutes/AddHoursMinutesModal";

const { Text, Title } = Typography;

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const [logOpen, setLogOpen] = useState(false);
  const [logTarget, setLogTarget] = useState<Assignee | null>(assignee);

  /** Сохранение часов */
  const handleSaveHours = async (hours: number, comment?: string) => {
    if (!logTarget) return;
    try {
      // await api.patch(`/tasks/${task.id}/assignees/${logTarget.id}`, { hours, comment });
      //assigneesRef.current?.setHours(logTarget.id, hours);
      message.success(`Часы обновлены: ${hours} ч`);
    } catch {
      message.error("Не удалось сохранить часы");
      throw new Error("save failed");
    }
  };
  return (
    <>
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
              style={{
                fontSize: 12,
                fontFamily: "monospace",
                marginLeft: "8px",
              }}
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
        {task.tags && task.tags.length > 0 && (
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
          due_date={task.due_date.toLocaleDateString("ru-RU")}
          overdueDays={task.overdueDays}
        />

        {/* Note */}
        {task.note && <TaskNote note={task.note} />}

        <Divider style={{ margin: "16px 0 12px" }} />

        <TaskAssignees initial={task.assignees} />

        <Divider style={{ margin: "12px 0" }} />
        <Button
          type="link"
          data-stop-card-click
          onClick={() => setLogOpen(true)}
        >
          Изменить свои часы
        </Button>
      </Card>
      <AddHoursMinutesModal
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
