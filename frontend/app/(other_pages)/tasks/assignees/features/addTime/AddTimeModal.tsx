"use client";

import { useEffect, useState } from "react";
import { InputNumber, Modal, Space, Typography, Alert, Input } from "antd";
import { Assignee } from "../../../interface/assignee.interface";
import styles from "./AddTimeModal.module.css";

const { Text } = Typography;

interface Props {
  open: boolean;
  assignee: Assignee | null;
  taskTitle?: string;
  onClose: () => void;
  onSave: (hours: number, comment?: string) => Promise<void> | void;
}

export default function AddTimeModal({
  open,
  assignee,
  taskTitle,
  onClose,
  onSave,
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
      await onSave(totalHours, comment || undefined);
      onClose();
    } finally {
      setSaving(false);
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
