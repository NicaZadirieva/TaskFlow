"use client";

import { useEffect, useState } from "react";
import {
  InputNumber,
  Modal,
  Space,
  Typography,
  Alert,
  Input,
  message,
} from "antd";
import styles from "./AddTimeModal.module.css";
import { Assignee } from "../../../interfaces/assignee.interface";

const { Text } = Typography;

interface Props {
  open: boolean;
  assignee: Assignee | null;
  taskTitle?: string;
  onClose: () => void;
}

export default function TimeCostsEditor({
  open,
  assignee,
  taskTitle,
  onClose,
}: Props) {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && assignee) {
      setHours(0);
      setMinutes(0);
      setComment("");
    }
  }, [open, assignee]);

  const handleSave = async () => {
    // Переводим всё в часы (десятичное число) для onSave
    const totalHours = hours + minutes / 60;

    if (totalHours <= 0) {
      return; // ничего не логируем, если 0
    }

    setSaving(true);
    try {
      // await api.patch(`/tasks/${task.id}/assignees/${logTarget.id}`, { hours, comment });
      message.success(`Часы обновлены: ${hours} ч`);
    } catch {
      message.error("Не удалось сохранить часы");
      throw new Error("save failed");
    }
  };

  return (
    <Modal
      open={open}
      title={`Сколько потратили сегодня на ${taskTitle ? ` — ${taskTitle}` : ""}?`}
      onCancel={onClose}
      onOk={handleSave}
      okText="Save"
      confirmLoading={saving}
      okButtonProps={{ disabled: hours === 0 && minutes === 0 }}
    >
      <div className={styles.content}>
        {assignee && (
          <Text type="secondary" className={styles.assignee}>
            Assignee: {assignee.user_name ?? assignee.id}
          </Text>
        )}

        <div className={styles.timeRow}>
          <div className={styles.timeField}>
            <Text className={styles.timeLabel}>Часы</Text>
            <InputNumber
              min={0}
              max={23}
              precision={0}
              value={hours}
              onChange={(v) => setHours(v ?? 0)}
              className={styles.timeInput}
            />
          </div>
          <div className={styles.timeField}>
            <Text className={styles.timeLabel}>Минуты</Text>
            <InputNumber
              min={0}
              max={59}
              precision={0}
              value={minutes}
              onChange={(v) => setMinutes(v ?? 0)}
              className={styles.timeInput}
            />
          </div>
        </div>

        <Input.TextArea
          rows={3}
          placeholder="Комментарий (необязательно)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <Alert
          type="info"
          showIcon
          title={`Итого: ${hours} ч ${minutes} мин`}
          className={styles.total}
        />
      </div>
    </Modal>
  );
}
