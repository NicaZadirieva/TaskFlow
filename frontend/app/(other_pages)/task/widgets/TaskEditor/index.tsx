"use client";

import { Task } from "@/app/(other_pages)/tasks/interfaces/task.interface";
import TaskHeader from "../../features/TaskHeader";
import EditTaskForm from "../../entities/EditTaskForm";
import { Button, Card, message, Space, Typography } from "antd";
import {
  AssigneeAdditor,
  AssigneeRemoval,
  ShowMetrics,
} from "@/app/(other_pages)/tasks/task/features";
import styles from "./index.module.css";
import { Assignee } from "@/app/(other_pages)/tasks/interfaces/assignee.interface";
import { TaskAssignee } from "@/app/(other_pages)/tasks/task/entities";
import { useMemo, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { TaskNote } from '@/app/(other_pages)/tasks/task/shared';

const { Text } = Typography;
export default function TaskEditor({ task }: { task: Task }) {
  const [removing, setRemoving] = useState<Assignee | null>(null);
  const [adding, setAdding] = useState(false);

  const activeCount = useMemo(
    () => task.assignees.filter((a) => !a.removed).length,
    [task.assignees],
  );
  const removedCount = task.assignees.length - activeCount;

  /* ---------- Удаление ---------- */
  const undoRemove = (id: number) => {
    message.info("Удаление отменено");
  };
  const removeAssignee = (updated: Assignee) => {
    message.success("Исполнитель удалён");
  };

  /* ---------- Добавление ---------- */
  const addAssignee = (assignee: Assignee) => {
    message.success("Исполнитель добавлен");
  };
  return (
    <>
      <TaskHeader task={task} />
      <div className={styles.grid}>
        <EditTaskForm task={task} />
        <div className={styles.right}>
          <Card className={styles.card}>
            <ShowMetrics
              due_date={task.due_date.toLocaleDateString("ru-RU")}
              overdueDays={task.overdueDays /**TODO: посчитать на фронтенде */}
              actualBudget={task.budget.fact}
              estimatedBudget={task.budget.planned}
              actualHours={task.hours.fact}
              estimatedHours={task.hours.planned}
            />
          </Card>
          <Card className={styles.card}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center", // было center
                marginBottom: 8,
                minHeight: 24,
              }}
            >
              <Text
                type="secondary"
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                }}
              >
                Исполнители
              </Text>
              <Space size={6} align="center">
                <Text strong style={{ fontSize: 12 }}>
                  {activeCount}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: "#dc2626",
                    visibility: removedCount > 0 ? "visible" : "hidden",
                  }}
                >
                  −{removedCount || 0}
                </Text>
                <Button
                  type="link"
                  size="small"
                  onClick={() => setAdding(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <PlusOutlined style={{ fontSize: 12, lineHeight: 1 }} />
                  добавить
                </Button>
              </Space>
            </div>
            <div
              style={{
                overflowY: "auto",
                overflowX: "hidden",
                paddingRight: 4, // чтобы контент не прилипал к скроллбару
              }}
            >
              <Space orientation="vertical" size={4} style={{ width: "100%" }}>
                {task.assignees.map((assignee) => {
                  return (
                    <TaskAssignee
                      assignee={assignee}
                      onChoose={(assignee) => setRemoving(assignee)}
                      onUndo={(assignee) => undoRemove(assignee.id)}
                    />
                  );
                })}
              </Space>
            </div>
          </Card>
		  {task.note && <TaskNote note={task.note}/>}
        </div>
      </div>
      <AssigneeAdditor
        isOpen={adding}
        onClose={() => setAdding(false)}
        save={addAssignee}
      />

      {removing && (
        <AssigneeRemoval
          assignee={removing}
          onClose={() => setRemoving(null)}
          isOpen={!!removing}
          onRemove={removeAssignee}
        />
      )}
    </>
  );
}
