import { WarningOutlined, InfoCircleOutlined } from "@ant-design/icons";
import styles from "./index.module.css";
export const DefaultTaskNote = () => (
  <TaskNote
    note={{
      kind: "info",
      label: "Замечаний нет",
      text: "Все хорошо",
    }}
  />
);
export default function TaskNote({
  note,
}: {
  note: { kind: "danger" | "info"; label: string; text: string };
}) {
  const isDanger = note.kind === "danger";

  return (
    <div
      className={`${styles.note} ${
        isDanger ? styles.noteDanger : styles.noteInfo
      }`}
    >
      {isDanger ? (
        <WarningOutlined className={`${styles.icon} ${styles.iconDanger}`} />
      ) : (
        <InfoCircleOutlined className={`${styles.icon} ${styles.iconInfo}`} />
      )}
      <span className={styles.label}>{note.label}:</span>
      <span className={styles.text}>{note.text}</span>
    </div>
  );
}
