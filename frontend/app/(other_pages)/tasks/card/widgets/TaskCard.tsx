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
import { TaskLabels } from "../entities/taskLabels/TaskLabels";
import {
  PRIORITY_META,
  STATUS_META,
  Task,
} from "../../interface/task.interface";
import { Assignee } from "../../interface/assignee.interface";
import styles from "./TaskCard.module.css";
import ShowMetrics from "../feature/showMetrics/ShowMetrics";
import TaskNote from "../entities/taskNote/TaskNote";

import AddTimeModal from "../../assignees/features/addTime/AddTimeModal";
import { assignee } from "../../mock-data/assignee";
import TaskAssignees from "../../assignees/widgets/TaskAssignees";

const { Text, Paragraph } = Typography;

// Пример данных изображений (в реальном проекте приходит из Task)
const taskImages: string[] = [
  "https://picsum.photos/seed/task1/800/600",
  "https://picsum.photos/seed/task2/800/600",
  "https://picsum.photos/seed/task3/800/600",
];

const DividerWithMargins = () => <Divider style={{ margin: "16px 0 12px" }} />;
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
  const isDescriptionLong = !!task.description && task.description.length > 180;

  return (
    <>
      <Card
        hoverable
        className={styles.cardActions}
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
        <div className={styles["priority-status__wrapper"]}>
          <div className={styles.priority__wrapper}>
            <Badge
              status={PRIORITY_META[task.priority].color}
              text={PRIORITY_META[task.priority].label}
              style={{ lineHeight: 1 }}
            />
          </div>

          <Tag color={STATUS_META[task.status].color}>
            {STATUS_META[task.status].label}
          </Tag>
        </div>

        {/* Контентная колонка */}
        <Space orientation="vertical" className={styles.content}>
          <Space
            orientation="horizontal"
            size="middle"
            className={styles.header}
          >
            <Tooltip title={task.title} placement="topLeft">
              <Text className={styles.header__text}>{task.title}</Text>
            </Tooltip>

            {task.project_id && (
              <Link href={"/projects/" + task.project_id}>
                <Button type="primary">К проекту</Button>
              </Link>
            )}
          </Space>
          <DividerWithMargins />
          <Space
            orientation="horizontal"
            size={"medium"}
            className={styles.attachments}
          >
            {/* Описание задачи */}
            {task.description && isDescriptionLong && (
              <Button
                type="link"
                size="small"
                data-stop-card-click
                className={styles.description__btn}
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

          <DividerWithMargins />

          {task.tags && task.tags.length > 0 && (
            <div className={styles.labels}>
              <TaskLabels
                labels={task.tags}
                max={4}
                onSelect={(l) => message.info(`Фильтр по метке: ${l.name}`)}
              />
            </div>
          )}

          <ShowMetrics
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
              note={{
                kind: "info",
                label: "Замечаний нет",
                text: "Все хорошо",
              }}
            />
          )}

          <DividerWithMargins />

          <TaskAssignees initial={task.assignees} />
        </Space>
      </Card>

      <AddTimeModal
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
          <Button onClick={() => setDescriptionModalOpen(false)}>
            Закрыть
          </Button>
        }
        width={640}
        centered
        destroyOnHidden
      >
        <Text>{"task id " + task.id}</Text>
        <Paragraph className={styles.description}>{task.description}</Paragraph>
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
