import { Button, message, Modal, Space, Tooltip, Typography } from "antd";
import { Dispatch, SetStateAction, useState } from "react";
import { Assignee } from "../../interface/assignee.interface";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
const { Text } = Typography;

export default function TaskAssignees({ initial, setEditing }: { initial: Assignee[], setEditing: Dispatch<SetStateAction<Assignee | null>> }) {
  const [assignees, setAssignees] = useState<Assignee[]>(initial);

  const removeAssignee = (id: string) => {
    const a = assignees.find((x) => x.id === id);
    if (!a) return;
    Modal.confirm({
      title: "Удалить исполнителя?",
      content: `${a.name} будет снят с задачи.`,
      okText: "Удалить",
      okButtonProps: { danger: true },
      cancelText: "Отмена",
      onOk: () => {
        setAssignees((prev) => prev.filter((x) => x.id !== id));
        message.success(`${a.name} удалён`);
      },
    });
  };

  const addAssignee = () => {
    const id = String(Date.now());
    setAssignees((prev) => [
      ...prev,
      {
        id,
        name: "Новый исполнитель",
        role: "TBD",
        hours: 0,
        planned: 1,
        color: "#dbeafe",
        textColor: "#2563eb",
      },
    ]);
    message.info("Исполнитель добавлен");
  };

  return (
    <div>
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
            {assignees.length}
          </Text>
          <Button
            type="link"
            size="small"
            icon={<PlusOutlined />}
            onClick={addAssignee}
          >
            добавить
          </Button>
        </Space>
      </div>

      <Space orientation="vertical" size={4} style={{ width: "100%" }}>
        {assignees.map((a) => {
          const overdue = a.hours > a.planned;
          return (
            <div
              key={a.id}
              className="assignee-row"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                padding: "4px 6px",
                margin: "0 -6px",
                borderRadius: 6,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {a.name}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: 0.3,
                  }}
                >
                  {a.role}
                </div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: overdue ? "#dc2626" : "#6b7280",
                  whiteSpace: "nowrap",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <b style={{ color: overdue ? "#dc2626" : "#1a1d21" }}>
                  {a.hours}
                </b>{" "}
                / {a.planned} ч
              </span>
              <Space size={2} className="assignee-actions">
                <Tooltip title="Сменить исполнителя">
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => setEditing(a)}
                  />
                </Tooltip>
                <Tooltip title="Удалить">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeAssignee(a.id)}
                  />
                </Tooltip>
              </Space>
            </div>
          );
        })}
      </Space>
    </div>
  );
}
