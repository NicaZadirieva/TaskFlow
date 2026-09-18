"use client";

import {
  Button,
  message,
  Space,
  Tooltip,
  Typography,
} from "antd";
import { useMemo, useState } from "react";
import { Assignee } from "../../interface/assignee.interface";
import {
  PlusOutlined,
  DeleteOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import styles from "./index.module.css";
import AddAssigneeModal from "./add/AddAssigneeModal";
import RemoveAssigneeModal from "./remove/RemoveAssigneeModal";

const { Text } = Typography;

interface Props {
  initial: Assignee[];
}


export default function TaskAssignees({ initial }: Props) {
  const [assignees, setAssignees] = useState<Assignee[]>(initial);

  // Модалка удаления
  const [removing, setRemoving] = useState<Assignee | null>(null);

  // Модалка добавления
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
        id: assignee.id ?? Date.now(), // или crypto.randomUUID()
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
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Text
          type="secondary"
          style={{
            fontSize: 11,
            textTransform: "uppercase",
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
            <Text style={{ fontSize: 11, color: "#dc2626" }} title="Удалённые">
              −{removedCount}
            </Text>
          )}
          <Button
            type="link"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => setAdding(true)}
          >
            добавить
          </Button>
        </Space>
      </div>

      {/* Список */}
      <Space orientation="vertical" size={4} style={{ width: "100%" }}>
        {assignees.map((a) => {
          const overdue = a.hours > a.planned;
          const removed = !!a.removed;

          return (
            <div
              key={a.id}
              className={
                styles[`assignee-row${removed ? " assignee-row--removed" : ""}`]
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

              <Space size={2} className={styles["assignee-actions"]}>
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
                        onClick={() => setRemoving(a)}
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
      <AddAssigneeModal
        isOpen={adding}
        onClose={() => setAdding(false)}
        save={addAssignee}
      />

      {/* Модалка удаления */}
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
