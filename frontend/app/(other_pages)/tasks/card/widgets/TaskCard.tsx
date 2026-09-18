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
  Tooltip,
  Modal,
  Image,
} from "antd";
import { PictureOutlined, FileTextOutlined } from "@ant-design/icons";
import Link from "next/link";
import { TaskLabels } from "../entities/TaskLabels";
import { PRIORITY_META, STATUS_META, Task } from "../../interface/task.interface";
import { Assignee } from "../../interface/assignee.interface";
import styles from './index.module.css';
import TaskShowMetrics from '../feature/TaskShowMetrics';
import TaskNote from '../entities/TaskNote';

import AddHoursMinutesModal from '../../assignees/features/AddHoursMinutesModal';
import { assignee } from '../../mock-data/assignee';
import TaskAssignees from '../../assignees/widgets/TaskAssignees';

const { Text, Title, Paragraph } = Typography;

// Пример данных изображений (в реальном проекте приходит из Task)
const taskImages: string[] = [
  "https://picsum.photos/seed/task1/800/600",
  "https://picsum.photos/seed/task2/800/600",
  "https://picsum.photos/seed/task3/800/600",
];

// Порог, после которого показываем кнопку "Открыть описание"
const DESCRIPTION_CLAMP_LINES = 3;

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const [logOpen, setLogOpen] = useState(false);
  const [logTarget, setLogTarget] = useState<Assignee | null>(assignee);
  const [imagesModalOpen, setImagesModalOpen] = useState(false);
  const [descriptionModalOpen, setDescriptionModalOpen] = useState(false);

  /** Сохранение часов */
  const handleSaveHours = async (hours: number, comment?: string) => {
    if (!logTarget) return;
    try {
      // await api.patch(`/tasks/${task.id}/assignees/${logTarget.id}`, { hours, comment });
      message.success(`Часы обновлены: ${hours} ч`);
    } catch {
      message.error("Не удалось сохранить часы");
      throw new Error("save failed");
    }
  };

  // Грубая эвристика: показывать кнопку, если текст длиннее ~180 символов
  const isDescriptionLong =
    !!task.description && task.description.length > 180;

  return (
    <>
      <Card
        hoverable
        className={styles.cardActions}
        style={{
          borderRadius: 0,
          height: 650,
          display: "flex",
          flexDirection: "column",
        }}
        styles={{
          body: {
            padding: 20,
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
          },
        }}
        actions={[
          <Button
            key="log"
            type="link"
            data-stop-card-click
            onClick={() => setLogOpen(true)}
          >
            Изменить свои часы
          </Button>,
        ]}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            <Badge
              status={PRIORITY_META[task.priority].color}
              text={PRIORITY_META[task.priority].label}
              style={{ lineHeight: 1 }}
            />
            <Text
              type="secondary"
              style={{
                fontSize: 12,
                fontFamily: "monospace",
                lineHeight: 1,
              }}
            >
              id {task.id}
            </Text>
          </div>

          <Space size={6} wrap style={{ alignItems: "baseline" }}>
            <Tag color={STATUS_META[task.status].color} style={{ margin: 0 }}>
              {STATUS_META[task.status].label}
            </Tag>
          </Space>
        </div>

        {/* Контентная колонка */}
        <Space
          orientation="vertical"
          style={{
            width: "100%",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Space orientation='horizontal' size="middle" style={{width: "100%", alignItems: "center", height: "50px", "justifyContent": "space-between" }}>
<Tooltip title={task.title} placement="topLeft">
            <Text
              className={styles.header}
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                wordBreak: "break-word"
              }}
            >
              {task.title}
            </Text>
          </Tooltip>
          {task.project_id && (
            <Link href={"/projects/" + task.project_id}>
    <Button type="primary">К проекту</Button>
  </Link>
          )}

          </Space>
          <Divider style={{ margin: "16px 0 12px" }} />
<Space orientation='horizontal' size={"medium"} style={{"justifyContent": "space-between", "width": "100%",}}>
  {/* Описание задачи */}
          {task.description && 
            isDescriptionLong && (
                <Button
                  type="link"
                  size="small"
                  data-stop-card-click
                  style={{ padding: 0, marginTop: 4, height: 'auto' }}
                  onClick={() => setDescriptionModalOpen(true)}
                >
                  <FileTextOutlined />
                  Открыть описание
                </Button>
              )}
              <div className={styles.imagesButtonWrapper}>
            <Badge count={taskImages.length} size="small" offset={[-2, 2]}>
              <Button
                onClick={() => setImagesModalOpen(true)}
                disabled={taskImages.length === 0}
              >
                <PictureOutlined />
                Изображения
              </Button>
            </Badge>
          </div>
</Space>
          
        
          <Divider style={{ margin: "16px 0 12px" }} />

          {task.tags && task.tags.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <TaskLabels
                labels={task.tags}
                max={4}
                onSelect={(l) => message.info(`Фильтр по метке: ${l.name}`)}
              />
            </div>
          )}

          
          <TaskShowMetrics
            actualBudget={task.budget.fact}
            actualHours={task.hours.fact}
            estimatedBudget={task.budget.planned}
            estimatedHours={task.hours.planned}
            due_date={task.due_date.toLocaleDateString("ru-RU")}
            overdueDays={task.overdueDays}
          />

          {task.note && <TaskNote note={task.note} />}
          {!task.note && (
            <TaskNote
              note={{ kind: 'info', label: "Замечаний нет", text: "Все хорошо" }}
            />
          )}

          <Divider style={{ margin: "16px 0 12px" }} />

          <TaskAssignees initial={task.assignees} />
        </Space>
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

      {/* Модальное окно с полным описанием */}
      <Modal
        title={task.title}
        open={descriptionModalOpen}
        onCancel={() => setDescriptionModalOpen(false)}
        footer={
          <Button onClick={() => setDescriptionModalOpen(false)}>Закрыть</Button>
        }
        width={640}
        centered
        destroyOnHidden
      >
        <Paragraph
          style={{
            margin: 0,
            fontSize: 14,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {task.description}
        </Paragraph>
      </Modal>

      {/* Модальное окно с галереей изображений */}
      <Modal
        title="Изображения задачи"
        open={imagesModalOpen}
        onCancel={() => setImagesModalOpen(false)}
        footer={null}
        width={800}
        centered
        destroyOnHidden
      >
        {taskImages.length > 0 ? (
          <Image.PreviewGroup>
            <div className={styles.imagesGrid}>
              {taskImages.map((src, idx) => (
                <Image
                  key={idx}
                  src={src}
                  alt={`Изображение ${idx + 1}`}
                  className={styles.imageItem}
                  width="100%"
                />
              ))}
            </div>
          </Image.PreviewGroup>
        ) : (
          <Text type="secondary">Изображений нет</Text>
        )}
      </Modal>
    </>
  );
};

export default TaskCard;