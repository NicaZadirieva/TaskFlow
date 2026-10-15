'use client';
// TODO: временно поставила use client. Нужно понять почему ошибка
import { Button, Space, Tooltip } from "antd";

import { Executor } from "@/entities/executor.interface";
import { DeleteOutlined, UndoOutlined } from "@ant-design/icons";
import styles from "./index.module.css";


export default function TaskAssignee({
  assignee,
  onChoose,
  onUndo,
}: {
  assignee: Executor;
  onChoose: (assignee: Executor) => void;
  onUndo: (assignee: Executor) => void;
}) {
  const overdue = assignee.hours > assignee.planned;
  const removed = !!assignee.removed;

  return (
    <div
      key={assignee.id}
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
          {assignee.user_name}
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
          {removed && assignee.remove_reason ? (
            <span style={{ color: "#dc2626", fontWeight: 600 }}>
              причина: {assignee.remove_reason}
            </span>
          ) : (
            assignee.role_in_task
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
          {assignee.hours}
        </b>{" "}
        / {assignee.planned} ч
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
              onClick={() => onUndo(assignee)}
            />
          </Tooltip>
        ) : (
          <Tooltip title="Удалить">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onChoose(assignee)}
            />
          </Tooltip>
        )}
      </Space>
    </div>
  );
}
