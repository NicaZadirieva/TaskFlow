import { WarningOutlined, InfoCircleOutlined } from "@ant-design/icons";

export default function TaskNote({
  note,
}: {
  note: { kind: "danger" | "info"; label: string; text: string };
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
        borderRadius: 8,
        padding: "10px 12px",
        marginTop: 12,
        fontSize: 12,
        lineHeight: 1.4,
        background: note.kind === "danger" ? "#fef2f2" : "#eff6ff",
        border: `1px solid ${note.kind === "danger" ? "#fecaca" : "#bfdbfe"}`,
        height: "70px",
        overflowY: "auto"
      }}
    >
      {note.kind === "danger" ? (
        <WarningOutlined style={{ color: "#dc2626", marginTop: 2 }} />
      ) : (
        <InfoCircleOutlined style={{ color: "#2563eb", marginTop: 2 }} />
      )}
      <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
        {note.label}:
      </span>
      <span style={{ flex: 1 }}>{note.text}</span>
    </div>
  );
}
