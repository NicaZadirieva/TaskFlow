import { message, Modal, Select, Typography } from "antd";
import { useState } from "react";

import TextArea from "antd/es/input/TextArea";

import styles from "./index.module.css";
import { Assignee } from "../../../interfaces/assignee.interface";

const { Text } = Typography;
const REMOVE_REASONS = [
  { value: "заболел", label: "Заболел" },
  { value: "отпуск", label: "Отпуск" },
  { value: "переведён на другой проект", label: "Переведён на другой проект" },
  { value: "не хватает компетенций", label: "Не хватает компетенций" },
  { value: "конфликт интересов", label: "Конфликт интересов" },
  { value: "задача отменена", label: "Задача отменена" },
  { value: "__custom", label: "Другое…" },
];

export default function AssigneeRemoval({
  isOpen,
  onClose,
  onRemove,
  assignee,
}: {
  assignee: Assignee;
  onRemove: (newAssignee: Assignee) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [removeReason, setRemoveReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");

  const closeRemoveModal = () => {
    setRemoveReason("");
    setCustomReason("");
  };

  const confirmRemove = async () => {
    const reason =
      removeReason === "__custom" ? customReason.trim() : removeReason;
    if (!reason) {
      message.warning("Укажите причину удаления");
      return;
    }
    const newAssignee = { ...assignee, removed: true, removeReason: reason };
    await onRemove(newAssignee);

    message.success(`${newAssignee.user_name} удалён: ${reason}`);
    closeRemoveModal();
  };

  const canConfirm =
    removeReason === "__custom"
      ? customReason.trim().length > 0
      : removeReason.length > 0;
  return (
    <Modal
      open={isOpen}
      title="Удалить исполнителя"
      onCancel={onClose}
      onOk={confirmRemove}
      okText="Удалить"
      cancelText="Отмена"
      okButtonProps={{ danger: true, disabled: !canConfirm }}
      destroyOnHidden
    >
      <div className={styles.content}>
        <Text type="secondary" className={styles.assigneeInfo}>
          {assignee.user_name} · {assignee.role_in_task}
        </Text>

        <div className={styles.field}>
          <Text className={styles.fieldLabel}>Причина удаления</Text>
          <Select
            className={styles.select}
            placeholder="Выберите причину"
            value={removeReason || undefined}
            onChange={setRemoveReason}
            options={REMOVE_REASONS}
          />
        </div>

        {removeReason === "__custom" && (
          <TextArea
            autoFocus
            rows={3}
            placeholder="Опишите причину"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            maxLength={200}
            showCount
            className={styles.customReason}
          />
        )}
      </div>
    </Modal>
  );
}
