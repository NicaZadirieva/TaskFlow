"use client";

import { Button, message, Space, Tooltip, Typography } from "antd";
import { useMemo, useState } from "react";
import { Assignee } from "../../interface/assignee.interface";
import { PlusOutlined, DeleteOutlined, UndoOutlined } from "@ant-design/icons";
import styles from "./index.module.css";
import AddAssigneeModal from "./add/AddAssigneeModal";
import RemoveAssigneeModal from "./remove/RemoveAssigneeModal";

const { Text } = Typography;

interface Props {
  initial: Assignee[];
}

export default function TaskAssignees({ initial }: Props) {
  const [assignees, setAssignees] = useState<Assignee[]>(initial);

  const [removing, setRemoving] = useState<Assignee | null>(null);
  const [adding, setAdding] = useState(false);

  const activeCount = useMemo(
    () => assignees.filter((a) => !a.removed).length,
    [assignees],
  );
  const removedCount = assignees.length - activeCount;

  /* ---------- Удаление ---------- */
  const undoRemove = (id: number) => {
    setAssignees((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, removed: false, removeReason: undefined } : x,
      ),
    );
    message.info("Удаление отменено");
  };
  const removeAssignee = (updated: Assignee) => {
    setAssignees((prev) =>
      prev.map((x) =>
        x.id === updated.id ? { ...x, ...updated, removed: true } : x,
      ),
    );
    message.success("Исполнитель удалён");
  };

  /* ---------- Добавление ---------- */
  const addAssignee = (assignee: Assignee) => {
    setAssignees((prev) => [
      ...prev,
      {
        ...assignee,
        id: assignee.id ?? Date.now(),
        removed: false,
        remove_reason: undefined,
        hours: assignee.hours ?? 0,
        planned: assignee.planned ?? 0,
      },
    ]);
    message.success("Исполнитель добавлен");
    setAdding(false);
  };

  return (
    <div>
      {/* Header */}
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
            style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
          >
            <PlusOutlined style={{ fontSize: 12, lineHeight: 1 }} />
            добавить
          </Button>
        </Space>
      </div>

      {/* Список */}
      <div
        className={styles.scrollArea}
        style={{
          maxHeight: 100, // подберите под макет
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: 4, // чтобы контент не прилипал к скроллбару
        }}
      >
        <Space orientation="vertical" size={4} style={{ width: "100%" }}>
          {assignees.map((a) => {
            const overdue = a.hours > a.planned;
            const removed = !!a.removed;

            return (
              <div
                key={a.id}
                className={
                  styles[
                    `assignee-row${removed ? " assignee-row--removed" : ""}`
                  ]
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                  padding: "4px 6px",
                  margin: "0 -6px",
                  borderRadius: 6,
                  opacity: removed ? 0.6 : 1,
                  minHeight: 40,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      textDecoration: removed ? "line-through" : "none",
                      textDecorationColor: "rgba(220,38,38,.5)",
                      lineHeight: 1.3,
                    }}
                  >
                    {a.user_name}
                    {removed && (
                      <span
                        style={{
                          marginLeft: 6,
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: 0.3,
                          textTransform: "uppercase",
                          padding: "1px 6px",
                          borderRadius: 999,
                          background: "#fef2f2",
                          color: "#dc2626",
                          lineHeight: 1,
                          display: "inline-block",
                          verticalAlign: "baseline",
                        }}
                      >
                        removed
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: 0.3,
                      lineHeight: 1.3,
                    }}
                  >
                    {removed && a.remove_reason ? (
                      <span style={{ color: "#dc2626", fontWeight: 600 }}>
                        причина: {a.remove_reason}
                      </span>
                    ) : (
                      a.role_in_task
                    )}
                  </div>
                </div>

                <span
                  style={{
                    fontSize: 11,
                    color: overdue && !removed ? "#dc2626" : "#6b7280",
                    whiteSpace: "nowrap",
                    fontVariantNumeric: "tabular-nums",
                    textDecoration: removed ? "line-through" : "none",
                    lineHeight: 1.3,
                  }}
                >
                  <b
                    style={{
                      color: overdue && !removed ? "#dc2626" : "#1a1d21",
                    }}
                  >
                    {a.hours}
                  </b>{" "}
                  / {a.planned} ч
                </span>

                <Space
                  size={2}
                  className={styles["assignee-actions"]}
                  style={{ alignSelf: "baseline" }}
                >
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
                    <Tooltip title="Удалить">
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => setRemoving(a)}
                      />
                    </Tooltip>
                  )}
                </Space>
              </div>
            );
          })}
        </Space>
      </div>
      {/* Модалки */}
      <AddAssigneeModal
        isOpen={adding}
        onClose={() => setAdding(false)}
        save={addAssignee}
      />

      {removing && (
        <RemoveAssigneeModal
          assignee={removing}
          onClose={() => setRemoving(null)}
          isOpen={!!removing}
          onRemove={removeAssignee}
        />
      )}
    </div>
  );
}
