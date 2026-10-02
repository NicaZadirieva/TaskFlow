"use client";

import { Assignee } from "@/entities/assignee.interface";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Space, Typography } from "antd";
import { useMemo } from "react";
import TaskAssignee from "../TaskAssignee";


const { Text } = Typography;

export default function Assignees({
  assignees,
  undoRemove,
  showAssigneeAddModal,
  showAssigneeRemoveModal,
}: {
  assignees: Assignee[];
  undoRemove: (assignee: Assignee) => void;
  showAssigneeAddModal: () => void;
  showAssigneeRemoveModal: (assignee: Assignee) => void;
}) {
  const activeCount = useMemo(
    () => assignees.filter((a) => !a.removed).length,
    [assignees],
  );
  const removedCount = assignees.length - activeCount;

  return (
    <>
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
            onClick={showAssigneeAddModal}
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
          {assignees.map((assignee) => {
            return (
              <TaskAssignee
                assignee={assignee}
                onChoose={showAssigneeRemoveModal}
                onUndo={(assignee) => undoRemove(assignee)}
              />
            );
          })}
        </Space>
      </div>
    </>
  );
}
